import RideDAO from "../RideDAO";

export default class GetRide {
    constructor (private rideDAO: RideDAO) {
    }

    async execute (rideId: string): Promise<Output> {
		const ride = await this.rideDAO.getById(rideId);
		if (!ride) throw new Error("Ride not found");
		return {
			rideId: ride.rideId,
			status: ride.getStatus(),
			driverId: ride.getDriverId(),
			passengerId: ride.passengerId
		};
	}
}

type Output = {
	rideId: string,
	status: string,
	driverId: string,
	passengerId: string
}