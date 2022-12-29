module Lib


open System


type public ToxTask = {
    full_env_name: string
    pretty_name: string
    line: int
}


let private toToxTask (line: int) (full_name: string): ToxTask list = 
    // TODO: support factors
    // TODO: support nesting
    [ {
        full_env_name = full_name
        pretty_name = full_name
        line = line
      }
    ]


type public ToxStructure = {
    name: string
    sub_structures: ToxStructure array
    sub_tests: ToxTask array
}


let private retrieveTestEnvs (lines: string list): ToxTask list = 
    []


type private EnvListAcc = {
    line: int
    isInToxEnv: bool
    isParsing: bool
    isFinished: bool
    elements: ToxTask list
}


let private defaultEnvListAcc: EnvListAcc = {
    line = 0
    isInToxEnv = false
    isParsing = false
    isFinished = false
    elements = []
}


let private isEnvListDeclaration (line: string): bool =
    ["env_list ="; "env_list="; "envlist ="; "envlist="]
    |> List.exists line.StartsWith


let private retrieveEnvFromEnvlistLine (line: string) (line_number: int): ToxTask list =
    line.Split([|' '; ','|], StringSplitOptions.RemoveEmptyEntries) 
    |> Array.toList
    |> List.collect (toToxTask line_number)


let private envListFold (acc: EnvListAcc) (line: string): EnvListAcc = 
    let toxSectionName = "[tox]"  // This currently does not take into account setup.cfg, or pyproject.toml
    let trimmedLine = line.Trim()
     
    let updatedAcc =
        if acc.isFinished then
            acc
        elif not acc.isInToxEnv && trimmedLine.Equals(toxSectionName) then
            { acc with isInToxEnv = true }
        elif acc.isInToxEnv && trimmedLine.StartsWith("[") && trimmedLine.Contains("]") then
            { acc with isInToxEnv = false; isFinished = true }
        elif acc.isInToxEnv && isEnvListDeclaration(trimmedLine) then
            let value = line.Split([|'='|], 2)[1]
            let new_elements = retrieveEnvFromEnvlistLine value acc.line
            { acc with isParsing = true; elements = acc.elements @ new_elements}
        elif acc.isInToxEnv && acc.isParsing && (trimmedLine.Contains("=")) then
            { acc with isInToxEnv = false; isFinished = true }
        elif acc.isInToxEnv && acc.isParsing then
            let new_elements = retrieveEnvFromEnvlistLine trimmedLine acc.line
            { acc with elements = acc.elements @ new_elements}
        else
            acc

    { updatedAcc with line = acc.line + 1 }


let private retrieveEnvListElements (lines: string list): ToxTask list =
    let result = List.fold envListFold defaultEnvListAcc lines
    result.elements


let private buildToxStructure (name: string) (tasks: ToxTask list): ToxStructure =
    // let sub_tests: ToxTask list = []
    let sub_structures: ToxStructure list = []

    { name = name;
      sub_structures = sub_structures |> List.toArray;
      sub_tests = tasks |> List.toArray;
    }


let public parseToxStructure (name: string) (tox_string: string): ToxStructure =
    let lines: string list = 
        tox_string.Split([|'\n'|],  StringSplitOptions.RemoveEmptyEntries)
        |> Array.toList
    
    let tasks = Set((retrieveTestEnvs lines) @ (retrieveEnvListElements lines)) |> Set.toList
    buildToxStructure name tasks
