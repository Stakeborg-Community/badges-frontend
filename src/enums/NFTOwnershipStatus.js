export const Owned = Symbol("OWNED");
export const Mintable = Symbol("MINTABLE");
export const NonMintable = Symbol("NON_MINTABLE");
export const Unknown = Symbol("UNKNOWN");

export const Priority = (s) => { 
    switch (s) {
        case Owned: return 0;
        case Mintable: return 0;
        case NonMintable: return 0;
        case Unknown: return 999;
        default: return 100000;
    }
}

const cardsStatusComparator = (a,b) => {
    const priorityA = Priority(a.status);
    const priorityB = Priority(b.status);
    return  priorityA > priorityB ? 1 : (priorityA < priorityB ? -1 : 0);
  }

export  const sortCards = (ownedStatus) => {
    let status = []
    for (let k in ownedStatus)
    {
      status.push({ 'id': k, 'status':ownedStatus[k]});
    }
    status.sort(cardsStatusComparator);
    return status;
  }