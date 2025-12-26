import { notifyManager } from "@tanstack/query-core";
import { unstable_batchedUpdates } from "./reactBatchedUpdates.ts";

notifyManager.setBatchNotifyFunction(unstable_batchedUpdates);
