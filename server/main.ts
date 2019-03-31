import {MongoClient, ObjectID} from 'mongodb'
import {prompt} from 'inquirer'

export default async () => {
	const mongoUrl = process.env.MONGO_URL
	const client = await MongoClient.connect(mongoUrl)
	const mainDb = client.db("main")
	const result = await mainDb.collection("command").
		find({type: "IMPORT_EVENT_BLOCK"}).
		project({"payload.dataWindowStart": 1, "payload.serviceClass": 1}).
		sort({"payload.dataWindowStart": -1}).limit(20)
	const results = (<{payload: {dataWindowStart: number, serviceClass}, _id: ObjectID}[]>await result.toArray()).filter(x => x.payload.dataWindowStart)

	const eventBlocks: {eventBlockId: string}[] = await mainDb.collection("eventblock").find({"eventBlockId": {$in: results.map(x => x._id.toHexString())}}).toArray()

	// console.log("Got results", results) 

	const choices = await prompt([{
		message: "Choose what to re-run",
		type: "checkbox",
		name: "commandChoices",
		choices: results.filter(x => x.payload.dataWindowStart).map(r => ({
			name: `${r.payload.serviceClass} - ${new Date(r.payload.dataWindowStart).toISOString()} - (${r.payload.dataWindowStart}) ${
				eventBlocks.filter(x => x.eventBlockId === r._id.toHexString()).length}`,
			value: r._id.toHexString(),
		}))
	}])

	console.log(choices)
}