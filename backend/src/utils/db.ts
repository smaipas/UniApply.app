import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(ddb, {
  marshallOptions: { removeUndefinedValues: true },
});

export const db = {
  async get<T>(
    table: string,
    key: Record<string, any>
  ): Promise<T | undefined> {
    const res = await doc.send(new GetCommand({ TableName: table, Key: key }));
    return res.Item as T | undefined;
  },
  async put<T>(table: string, item: T): Promise<T> {
    await doc.send(new PutCommand({ TableName: table, Item: item as any }));
    return item;
  },
  async update<T>(
    table: string,
    key: any,
    updates: Record<string, any>
  ): Promise<T> {
    const exp: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, any> = {};
    let i = 0;
    for (const k of Object.keys(updates)) {
      if (typeof updates[k] === "undefined") continue;
      i++;
      exp.push(`#f${i} = :v${i}`);
      names[`#f${i}`] = k;
      values[`:v${i}`] = updates[k];
    }
    if (!exp.length) {
      const current = await this.get<T>(table, key);
      return current as T;
    }
    const res = await doc.send(
      new UpdateCommand({
        TableName: table,
        Key: key,
        UpdateExpression: "SET " + exp.join(", "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      })
    );
    return res.Attributes as unknown as T;
  },
  async delete(table: string, key: any): Promise<boolean> {
    await doc.send(new DeleteCommand({ TableName: table, Key: key }));
    return true;
  },
  async scan<T>(table: string): Promise<T[]> {
    const res = await doc.send(new ScanCommand({ TableName: table }));
    return (res.Items || []) as T[];
  },
  async query<T>(params: {
    TableName: string;
    IndexName?: string;
    KeyConditionExpression: string;
    ExpressionAttributeValues: Record<string, any>;
    ExpressionAttributeNames?: Record<string, string>;
  }): Promise<T[]> {
    const res = await doc.send(new QueryCommand(params as any));
    return (res.Items || []) as T[];
  },
};
