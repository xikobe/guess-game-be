import axios from 'axios';

export async function fetchBTCPrice(): Promise<number | null> {
    try {
        const response = await axios.get(process.env.BTC_API_URL!);
        return response.data.bpi.USD.rate_float;
    } catch (error) {
        console.error('Error fetching BTC price:', (error as Error).message);
        return null;
    }
}
