const LineConnect = require('./connect');
const LINE = require('./main.js');

/*
| This constant is for auth/login
| 
| Change it to your authToken / your email & password
*/
const auth = {
	authToken: 'EpR1sagay0r0QJcX9tKb.bCOO/5H4f62FSyzyp+jJsW.NsxCY9P2DP+kDx8/RDup2ZiO4KmoXyjckZCTVnsORvU=',
	certificate: '2fcf175610c86b76334136ec5b02f807ff9e40f8ddf2bb98d089114a45cc15c3',
	email: '',
	password: ''
}

//let client = new LineConnect();
let client =  new LineConnect(auth);

client.startx().then(async(res) => {
	while (true) {
		try {
			ops = await client.fetchOps(res.operation.revision);
		} catch (error) {
			console.log('error', error)
		}
		for (let op in ops) {
			if (ops[op].revision.toString() != -1) {
				res.operation.revision = ops[op].revision;
				LINE.poll(ops[op])
			}
		}
		//LINE.aLike() //AutoLike (CAUSE LAG)
	}
});