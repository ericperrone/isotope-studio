import { DataGatheringSession } from "./main-data-processing/main-data-processing.component";

export class DataGathering {
    protected session: DataGatheringSession = { samples: [], key: '', headerPosition: 0, endTable: 1 };
}