# Personal Introduction

Hi, I'm Fernanda. I moved to Munich about five months ago, and I previously worked in Brazil as a full-stack developer. I am very interested in being selected for this course because I want to return to the tech job market. I am currently studying Computer Science in the University in a fully online program, and I have the full 40 hours available to participate and progress through the program.

---

# Project Choice

I am a full-stack developer with a background in Java, but I also worked on the frontend using Angular. Even though Java is more comfortable for me, I chose to challenge myself by building a frontend-focused project.  

Currently, I maintain a travel website built with React where I share my travel experiences:  
**https://www.feitosparaviajar.com.br/pt**

---

# Project Explanation

The development of this project was supported by **ChatGPT**, and I also used **GitHub Copilot** in my IDE. The main features and challenges are:

### 1. Two Inputs
- The project has **two input fields**, each calling a separate API:  
  - **City input**: sends the city name to the Localities API.  
  - **Postal Code (PLZ) input**: sends the postal code to the Localities API.  

### 2. Input Validations
- **City validation**:  
  - Initially, API calls worked correctly, but adding conditional logic caused issues.  
  - ChatGPT suggested comparing lowercase strings to ensure proper matches:

    ```ts
    (item) => item.name.toLowerCase() === cityName.toLowerCase()
    ```

- **PLZ validation**:  
  - Initially, the API suggested a postal code after typing only two digits.  
  - To improve accuracy, the API call now only triggers when **5 digits** are entered.  

### 3. Preventing Overwriting
- Problem: Both inputs call APIs, which could overwrite each other.  
  - Example: Typing PLZ `80637` auto-fills city as `Munchen`. Typing `Munchen` again triggers the city API, showing a dropdown and potentially overwriting the PLZ.  
- **Solution**: Flags to track input origin:

    ```ts
    // Flags to track input origin
    const [isCityManual, setIsCityManual] = useState(false);
    const [isPlzManual, setIsPlzManual] = useState(false);
    const [isCityFromApi, setIsCityFromApi] = useState(false);
    const [isPlzFromApi, setIsPlzFromApi] = useState(false);
    ```

- Manual inputs set `isCityManual` or `isPlzManual` to `true`.  
- API updates set `isCityFromApi` or `isPlzFromApi` to `true`.  
- Debounced API calls skip if the respective "FromApi" flag is true.

### 4. Debounce Logic
- Chatgpt helped me with debounce prevents excessive API calls while typing:

```ts
// --- Debounce PLZ input logic ---
useEffect(() => {
  if (isPlzFromApi) { // Skip if PLZ updated by API
    setIsPlzFromApi(false);
    return;
  }

  if (plzTimer) clearTimeout(plzTimer);

  // Fetch only when PLZ reaches 5 digits
  if (plz.length === 5) {
    const timer = window.setTimeout(() => fetchCityByPlz(plz), 1000);
    setPlzTimer(timer);
  }

  return () => {
    if (plzTimer) clearTimeout(plzTimer);
  };
}, [plz]);
```

### 4.Error Handling

Error handling in the project is designed to be simple and user-friendly:

- **Inline error messages** are displayed immediately below the input fields.  
- Examples of error messages include:
  - `"City not found."` when the city input does not match any result from the API.  
  - `"PLZ not found."` when the postal code input does not return a valid city.  
- Example implementation in React:


<div>
  {error && <p style={{ color: 'red' }}>{error}</p>}
</div>


### 5.Design

The project design focuses on clarity, usability, and a modern look:

- **Background**: A semi-transparent image of **Regensburg** is used to enhance the visual appeal.  
- **Inputs and Dropdowns**: Styled with modern UI principles, including:
  - Rounded borders
  - Consistent spacing and padding
  - Subtle hover effects
- **Color Scheme**: Dark theme with blue accents to improve readability and maintain focus.  
- **Responsiveness**: Layout adapts to different screen sizes for consistent usability.  

This design combines aesthetics with usability to create a polished and professional interface.
