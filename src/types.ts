export interface User {
    username: string;
    score: number;
    currentGuess?: string; // 'up' or 'down'
    guessTime?: string;
    priceAtGuessTime?: number;
}
