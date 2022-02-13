export const Owned = Symbol("OWNED");
export const Mintable = Symbol("MINTABLE");
export const NonMintable = Symbol("NON_MINTABLE");
export const Unknown = Symbol("UNKNOWN");

export const Priority = (s) => { 
    switch (s) {
        case Owned: return 0;
        case Mintable: return 1;
        case NonMintable: return 2;
        case Unknown: return 999;
        default: return 100000;
    }
}