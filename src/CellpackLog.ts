import * as appRoot from "app-root-path"
import * as Promise from "bluebird"
import * as Bunyan from "bunyan"
import * as Lodash from "lodash"
//
import { Cellpack, Connection, Transmitter, Log } from "microb"

export default class CellpackLog extends Cellpack {

    private debug: boolean
    private logger: Bunyan

    init(){
        // own config
        this.config = this.environment.get("cellpacks")["cellpack-log"]
        // debug
        if(this.config.debug !== undefined) this.debug = this.config.debug
        else this.config = this.environment.get('debug',false)

        let logPath = this.config.path || `${appRoot}/logs`

        this.logger = Bunyan.createLogger({
            name: "cellpack-log",
            src: true,
            streams: [{
                level: this.config.level || Bunyan.INFO,
                type: 'rotating-file',
                path: `${logPath}/microb.log`,
                period: this.config.period || '1d',
                count: this.config.count || 7
            },{
                level: Bunyan.ERROR,
                type: 'rotating-file',
                path: `${logPath}/errors.log`,
                period: this.config.period || '1d',
                count: this.config.count || 7
            }]
        })

        let logger = this
        this.transmitter.on("log.**", function(log: string){ logger.log(this.event,log) })

        return Promise.resolve()
    }

    private log(event: string, log: string | Log): void {
        if(Lodash.isString(log)){
            log = <Log>{
                type: "info",
                msg: log
            }
        }

        let type = log.type
        let msg = log.msg
        delete log.type
        delete log.msg

        let l: any = <any>log
        l.event = event

        if(type === "trace") this.logger.trace(l,msg)
        else if(type === "debug") this.logger.debug(l,msg)
        else if(type === "info") this.logger.info(l,msg)
        else if(type === "error") this.logger.error(l,msg)
        else if(type === "fatal") this.logger.fatal(l,msg)
        else this.logger.warn(l,msg)
    }
}
