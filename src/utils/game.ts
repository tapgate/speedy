
export const speedToPointsArray = (speed: number): number[][] => {
    const pointsArray: number[][] = new Array(10).fill(0).map(() => [0, 0]);

    pointsArray.forEach((_, index) => {

        const clockSpeed = Math.floor((speed ?? 1) * ((10 - index) / 10));
        const points = Math.floor((((10 * (index / 1)) + 10) ** 2) / 100);

        pointsArray[index] = [clockSpeed, points];
    })

    return pointsArray;
}

export const clockSpeedPoint = (speed: number, maxSpeed: number): number => {
    const pointsArray = speedToPointsArray(maxSpeed);
    
    // based on speed get closest clock speed
    const posibilities = pointsArray.map((curr) => {
        return (speed <= curr[0]) ? curr[0] : -1;
    }).filter((x) => (x !== -1));

    const closestClockSpeed = posibilities.pop();

    // based on closest clock speed get points
    const points = pointsArray.find((point) => point[0] === closestClockSpeed)?.pop();

    return points ?? 0;
}

