// src/ApiService.js
export class ApiService {
    static BASE_URL = "https://recruiting.verylongdomaintotestwith.ca/api/{suryanshbali}/character";

    // post call to save the characters
    static async saveCharacter(characterData) {
        try {
            const response = await fetch(this.BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(characterData),
            });

            if (!response.ok) {
                throw new Error(`failed to save character: ${response.statusText}`);
            }
            console.log("character saved successfully!");
        } catch (error) {
            console.error("error saving character:", error);
        }
    }

    // get call to fetch the most recent character
    static async getCharacter() {
        try {
            const response = await fetch(this.BASE_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`failed to retrieve character: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("error retrieving character:", error);
            return null;
        }
    }
}
