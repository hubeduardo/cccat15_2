import AccountDAO, { AccountDAODatabase } from "../src/AccountDAO";
import { RideDAO }  from "../src/RideDAO";
import GetAccount from "../src/usecase/GetAccount";
import RequestRide from "../src/usecase/RequestRide";
import Signup  from "../src/usecase/Signup";
import GetRide from "../src/usecase/GetRide";
import AcceptRide from "../src/usecase/AcceptRide";
import StartRide from "../src/usecase/StartRide";

let signup: Signup;
let getAccount: GetAccount;
let requestRide: RequestRide;
let getRide: GetRide;
let acceptRide: AcceptRide;
let startRide: StartRide;

// integration test com uma granularidade mais fina
beforeEach(() => {
	const accountDAO = new AccountDAODatabase();
	signup = new Signup(accountDAO);
	getAccount = new GetAccount(accountDAO);
    const requestRideDAO = new RideDAO()
    requestRide = new RequestRide(requestRideDAO, accountDAO);
	getRide = new GetRide(requestRideDAO);
    acceptRide = new AcceptRide(requestRideDAO, accountDAO);
	startRide = new StartRide(requestRideDAO);
});

test("Deve iniciar uma corrida", async function () {
	const inputSignupPassenger = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true,
		password: "123456"
	};
	const outputSignupPassenger = await signup.execute(inputSignupPassenger);
	const inputRequestRide = {
		passengerId: outputSignupPassenger.accountId,
		fromLat: -27.584905257808835,
		fromLong: -48.545022195325124,
		toLat: -27.496887588317275,
		toLong: -48.522234807851476
	};
	const outputRequestRide = await requestRide.execute(inputRequestRide);
	const inputSignupDriver = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		carPlate: "AAA9999",
		isDriver: true,
		password: "123456"
	};
	const outputSignupDriver = await signup.execute(inputSignupDriver);
	const inputAcceptRide = {
		rideId: outputRequestRide.rideId,
		driverId: outputSignupDriver.accountId
	}
	await acceptRide.execute(inputAcceptRide);
	const inputStartRide = {
		rideId: outputRequestRide.rideId
	};
	await startRide.execute(inputStartRide);
	const outputGetRide = await getRide.execute(outputRequestRide.rideId);
	expect(outputGetRide.status).toBe("in_progress");
});

