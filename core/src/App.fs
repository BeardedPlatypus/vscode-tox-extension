module Lib


open System


type public ToxTask = {
    full_env_name: string;
    line: int;
}


type public ToxStructure = {
    name: string
    sub_structures: ToxStructure list;
    sub_tests: ToxTask list;
}


let private retrieveTestEnvs (lines: string list): ToxTask list = 
    []


let private retrieveEnvListElements (lines: string list): ToxTask list =
    []


let private buildToxStructure (name: string) (tasks: ToxTask list): ToxStructure =
    let sub_tests: ToxTask list = []
    let sub_structures: ToxStructure list = []

    { name = name;
      sub_structures = sub_structures;
      sub_tests = sub_tests;
    }


let public parseToxStructure (name: string) (tox_string: string): ToxStructure =
    let lines: string list = 
        tox_string.Split([|'\n'|],  StringSplitOptions.RemoveEmptyEntries)
        |> Array.toList
    
    let tasks = Set((retrieveTestEnvs lines) @ (retrieveEnvListElements lines)) |> Set.toList
    buildToxStructure name tasks
