const LineConnect = require('./connect');
const LINE = require('./main.js');

/*
| This constant is for auth/login
| 
| Change it to your authToken / your email & password
*/
const auth = {
	authToken: 'EoUtjrObWgRgdLWDnsJc.FPRJAoTY9OwIvv8wHqyyZa.tyloxv3gqtRSexUf//ObBwOrEUi+Uf9NZW2zhewuN/Q=',
	certificate: 'fcd1eb003833027c7e33cab30f45319c14783c785ce4ed4635b6f3d800fb4430',
	//email: 'si.andi.kiks@gmail.com',
	//password: 'ASDer123'
}

//let client =  new LineConnect();
let client =  new LineConnect(auth);

client.startx().then(async (res) => {
	while(true) {
		try {
			ops = await client.fetchOps(res.operation.revision);
		} catch(error) {
			console.log('error',error)
		}
		for (let op in ops) {
			if(ops[op].revision.toString() != -1){
				res.operation.revision = ops[op].revision;
				LINE.poll(ops[op])
			}
		}
		//LINE.aLike() //AutoLike (CAUSE LAG)
	}
});
