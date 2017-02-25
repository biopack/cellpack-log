/// <reference types="bluebird" />
import * as Promise from "bluebird";
import { Cellpack } from "microb";
export default class CellpackLog extends Cellpack {
    private debug;
    private logger;
    init(): Promise<void>;
    private log(event, log);
}
