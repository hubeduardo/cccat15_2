import AccountDAO, { AccountDAODatabase, AccountDAOMemory } from "../src/AccountDAO";
import { RideDAO }  from "../src/RideDAO";
import GetAccount from "../src/usecase/GetAccount";
import RequestRide from "../src/usecase/RequestRide";
import Signup  from "../src/usecase/Signup";
import GetRide from "../src/usecase/GetRide";

let signup: Signup;
let getAccount: GetAccount;
let requestRide: RequestRide;
let getRide: GetRide;

// integration test com uma granularidade mais fina
beforeEach(() => {
	const accountDAO = new AccountDAODatabase();
	signup = new Signup(accountDAO);
	getAccount = new GetAccount(accountDAO);
    const requestRideDAO = new RideDAO()
    requestRide = new RequestRide(requestRideDAO, accountDAO)
	getRide = new GetRide(requestRideDAO)
});

test("Deve solicitar uma corrida", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true
	};
	const outputSignup = await signup.execute(input);
	const inputRequestRide = {
        passengerId: outputSignup.accountId,
        fromLat: -23.55052,
        fromLong: -46.633308,
        toLat: -23.454317,
        toLong: -46.533652
    }
    const outputRequestRide = await requestRide.execute(inputRequestRide);
    expect(outputRequestRide.rideId).toBeDefined();
	const outputGetRide = await getRide.execute(outputRequestRide.rideId);
	expect(outputGetRide.status).toBe("requested");

	
});

test("Somente passageiros podem pedir uma corrida ", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: false
	};
	const outputSignup = await signup.execute(input);
	const inputRequestRide = {
        passengerId: outputSignup.accountId,
        fromLat: -23.55052,
        fromLong: -46.633308,
        toLat: -23.454317,
        toLong: -46.533652
    }
    await expect(() => requestRide.execute(inputRequestRide)).rejects.toThrow(new Error("Only passengers can request a ride"));
});

test("Não deve poder solicitar uma corrida se o passageiro já tiver outra corrida ativa", async function () {
	const inputSignup = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "97456321558",
		isPassenger: true,
		password: "123456"
	};
	const outputSignup = await signup.execute(inputSignup);
	const inputRequestRide = {
		passengerId: outputSignup.accountId,
		fromLat: -27.584905257808835,
		fromLong: -48.545022195325124,
		toLat: -27.496887588317275,
		toLong: -48.522234807851476
	};
	await requestRide.execute(inputRequestRide);
	await expect(() => requestRide.execute(inputRequestRide)).rejects.toThrow("Passenger has an active ride");
});
