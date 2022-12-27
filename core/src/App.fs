module Lib


type public ToxTask = {
    full_env_name: string;
    line: int;
}


type public ToxStructure = {
    name: string
    sub_structures: ToxStructure list;
    sub_tests: ToxTask list;
}


let public parseToxStructure (name: string) (tox_string: string): ToxStructure =
    let sub_tests: ToxTask list = []
    let sub_structures: ToxStructure list = []

    let root_structure = {
        name = name;
        sub_structures = sub_structures;
        sub_tests = sub_tests;
    }

    root_structure
