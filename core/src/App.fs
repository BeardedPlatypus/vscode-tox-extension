module Lib


open System


type public ToxTask = {
    full_env_name: string
    pretty_name: string
    line: int
}


let private computeFactors (name: string) : (string list) list =
    let splitConditionals (factor: string): string list =
        // TODO: Handle the case where a factor is malformed.
        if factor.Contains "{" && factor.Contains "}" then
            let components = factor.Split([|'{'; '}'|])
            let prefix = components.[0]
            let conditionals = components.[1]
            let postfix = components.[2]

            conditionals.Split([|','|])
            |> Array.toList
            |> List.map (fun (c: string) -> $"{prefix}{c}{postfix}")
        else
            [ factor ]
            

    let factors = name.Split([|'-'|], StringSplitOptions.RemoveEmptyEntries)

    factors 
    |> Array.toList
    |> List.map splitConditionals


let private generateToxNames (factors: (string list) list): string list =
    match factors with
    | head :: tail ->
        let addFactor (factor: string) =
            List.map (fun (s: string) -> $"{s}-{factor}")
        
        let folder (acc: string list) (v: string list) =
            List.collect (fun v_elem -> addFactor v_elem acc) v
        List.fold folder head tail
    | [] -> 
        []


let private toToxTask (line: int) (full_name: string): ToxTask list = 
    // Note we currently assume the name is well-formed. This includes the following assumptions:
    // * '-' does not occur in conditional statements, i.e. inside '{.*}'.
    // * Factors contain at most one '{.*}' substring.
    // * If a factor contains a '{' then it will contain a '}' and vice-versa.
    let toTask (task: string): ToxTask = {
        full_env_name = task 
        pretty_name = task
        line = line
    }

    computeFactors full_name
    |> generateToxNames
    |> List.map toTask


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


type private SplitTasksAcc = {
    current_element_reversed: char list
    is_in_factor: bool
    elements_reversed: string list
}


let private defaultSplitTasksAcc: SplitTasksAcc = {
    current_element_reversed = []
    is_in_factor = false
    elements_reversed = []
}


let private toElement (l: char list): string =
    String.Join("", l |> List.rev)


let private SplitTasksFolder (acc: SplitTasksAcc) (v: char): SplitTasksAcc = 
    match v with
    // Spaces are trimmed by default to simplify parsing later on
    | ' ' -> acc
    // We assume that we cannot have nested factors.
    | '{' -> 
        { acc with current_element_reversed = '{' :: acc.current_element_reversed; 
                   is_in_factor = true
        } 
    | '}' -> 
        { acc with current_element_reversed = '}' :: acc.current_element_reversed; 
                   is_in_factor = false
        }
    | ',' when not acc.is_in_factor -> 
        let current_element = acc.current_element_reversed |> toElement
        { acc with current_element_reversed = []
                   elements_reversed = current_element :: acc.elements_reversed
        }
    | c -> 
        { acc with current_element_reversed = c :: acc.current_element_reversed }


let private splitTasks (line: string): string list =
    let tasks_acc = line |> Seq.fold SplitTasksFolder defaultSplitTasksAcc
    let last_element = tasks_acc.current_element_reversed |> toElement

    last_element :: tasks_acc.elements_reversed
    |> List.filter (fun t -> not (String.IsNullOrEmpty t))
    |> List.rev


let private retrieveEnvFromEnvlistLine (line: string) (line_number: int): ToxTask list =
    splitTasks line
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

