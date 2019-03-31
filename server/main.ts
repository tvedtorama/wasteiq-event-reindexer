import {MongoClient, ObjectID} from 'mongodb'
import {prompt} from 'inquirer'
import {default as Axios} from 'axios'

type IOptionTyple = "Nothing" | "delete blocks & re-index" | "re-index" | "delete COMMAND & blocks!!!"
const deleteEventBlocksActions: IOptionTyple[] = ["delete blocks & re-index", "delete COMMAND & blocks!!!"]
const deleteCmdActions: IOptionTyple[] = ["delete COMMAND & blocks!!!"]
const reIndexActions: IOptionTyple[] = ["delete blocks & re-index", "re-index"]

const eventblockQuery = (cmds: string[]) =>
	({"eventBlockId": {$in: cmds}})

const action = async (a: IOptionTyple, ids: string[], mainDb) => {
	if (deleteEventBlocksActions.indexOf(a) > -1) {
		const res = await mainDb.collection("eventblock").deleteMany(eventblockQuery(ids))
		console.log("Deleted eventblocks", res.result)
	}
	if (deleteCmdActions.indexOf(a) > -1) {
		const res = await mainDb.collection("command").deleteMany({_id: {$in: ids.map(id => new ObjectID(id))}})
		console.log("Deleted commands", res.result)
	}

	if (reIndexActions.indexOf(a) > -1) {
		const cmdUrl = process.env.COMMAND_URL
		const results = await Promise.all(ids.map(async id =>
			await Axios.post(`${cmdUrl}/${id}/`, {})))
		console.log("Called re-index", results.map(x => x.data))
	}
}

export default async () => {
	const mongoUrl = process.env.MONGO_URL
	const client = await MongoClient.connect(mongoUrl)
	const mainDb = client.db("main")
	const result = await mainDb.collection("command").
		find({type: "IMPORT_EVENT_BLOCK"}).
		project({"payload.dataWindowStart": 1, "payload.serviceClass": 1}).
		sort({"payload.dataWindowStart": -1}).limit(20)
	const results = (<{payload: {dataWindowStart: number, serviceClass}, _id: ObjectID}[]>await result.toArray()).filter(x => x.payload.dataWindowStart)

	const cmdIds = results.map(x => x._id.toHexString())
	const eventBlocks: {eventBlockId: string}[] = await mainDb.collection("eventblock").find(eventblockQuery(cmdIds)).toArray()

	// console.log("Got results", results) 


	const choices = await prompt([{
		message: "Choose what to re-run",
		type: "checkbox",
		name: "cmdIds",
		choices: results.filter(x => x.payload.dataWindowStart).map(r => ({
			name: `${r.payload.serviceClass} - ${new Date(r.payload.dataWindowStart).toISOString()} - (${r.payload.dataWindowStart}) ${
				eventBlocks.filter(x => x.eventBlockId === r._id.toHexString()).length}`,
			value: r._id.toHexString(),
		}))
	},
		{
			message: "What should we do with them",
			type: "list",
			name: "action",
			choices: <{checked?: boolean, name: IOptionTyple}[]>[{
				checked: true,
				name: "Nothing",
			}, {
				name: "delete blocks & re-index",
			}, {
				name: "re-index",
			}, {
				name: "delete COMMAND & blocks!!!",
			}]
		}
	])

	console.log(choices)

	if (choices["action"] === <IOptionTyple>"Nothing")
		return

	try {
		await action(choices["action"], choices["cmdIds"], mainDb)
	} catch (err) {
		console.error(err)
	}
}