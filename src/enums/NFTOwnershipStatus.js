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
    let collections = {}
    for (let name in ownedStatus) {
      let values = ownedStatus[name]
      let status = []
      for (let i=0; i<values.length; i++)
      {
        status.push({ 'id': values[i].id, 'status':values[i].status});
      }
      status.sort(cardsStatusComparator);
      collections[name] = status;
    }
    
    return collections;
  }