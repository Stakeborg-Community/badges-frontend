class Logger 
{
    constructor(enabled = false)
    {
        this.enabled = enabled;
    }
    
    log(...args) { return this.enabled ? console.log(args) : true; }
    warn(...args) { return this.enabled ? console.warn(args) : true;}
    debug(...args) { return this.enabled ? console.debug(args) : true;}
    groupCollapsed(...args) { return this.enabled ? console.groupCollapsed(args) : true;}
    groupEnd(...args) { return this.enabled ? console.groupEnd(args) : true; }

}

export const dLogger = new Logger(false);
export const eLogger = new Logger(true);
export const logger = eLogger;