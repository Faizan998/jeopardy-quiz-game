const quizData = {
    categories: [
      {
        name: "science",
        questions: [
          {
            question: "What is the chemical symbol for gold?",
            options: ["Au", "Ag", "Pb", "Fe"],
            correctIndex: 0,
            amount: 100,
          },
          {
            question: "Which planet is known as the Red Planet?",
            options: ["Mars", "Venus", "Jupiter", "Saturn"],
            correctIndex: 0,
            amount: 200,
          },
          {
            question: "What gas do plants absorb from the atmosphere?",
            options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
            correctIndex: 2,
            amount: 300,
          },
          {
            question: "What is the boiling point of water at sea level?",
            options: ["90°C", "100°C", "110°C", "120°C"],
            correctIndex: 1,
            amount: 400,
          },
          {
            question: "What part of the cell contains genetic material?",
            options: ["Cytoplasm", "Mitochondria", "Nucleus", "Ribosome"],
            correctIndex: 2,
            amount: 500,
          },
          
        ],
      },
      {
        name: "history",
        questions: [
          {
            question: "Who was the first President of the United States?",
            options: [
              "Thomas Jefferson",
              "George Washington",
              "Abraham Lincoln",
              "John Adams",
            ],
            correctIndex: 1,
            amount: 100,
          },
          {
            question: "In which year did World War II end?",
            options: ["1942", "1945", "1948", "1950"],
            correctIndex: 1,
            amount: 200,
          },
          {
            question: "Which ancient civilization built the pyramids?",
            options: ["Romans", "Greeks", "Egyptians", "Mayans"],
            correctIndex: 2,
            amount: 300,
          },
          {
            question: "Who discovered America in 1492?",
            options: [
              "Christopher Columbus",
              "Vasco da Gama",
              "Marco Polo",
              "Ferdinand Magellan",
            ],
            correctIndex: 0,
            amount: 400,
          },
          {
            question:
              "Which war was fought between the North and South regions of the United States?",
            options: [
              "World War I",
              "American Civil War",
              "Vietnam War",
              "Revolutionary War",
            ],
            correctIndex: 1,
            amount: 500,
          },
          
        ],
      },
      {
        name: "geography",
        questions: [
          {
            question: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            correctIndex: 2,
            amount: 100,
          },
          {
            question: "Which is the largest ocean on Earth?",
            options: [
              "Atlantic Ocean",
              "Indian Ocean",
              "Arctic Ocean",
              "Pacific Ocean",
            ],
            correctIndex: 3,
            amount: 200,
          },
          {
            question: "Which continent has the most countries?",
            options: ["Africa", "Asia", "Europe", "South America"],
            correctIndex: 0,
            amount: 300,
          },
          {
            question: "Which is the longest river in the world?",
            options: [
              "Amazon River",
              "Nile River",
              "Yangtze River",
              "Mississippi River",
            ],
            correctIndex: 1,
            amount: 400,
          },
          {
            question: "Mount Everest is located in which mountain range?",
            options: ["Andes", "Rockies", "Himalayas", "Alps"],
            correctIndex: 2,
            amount: 500,
          },
        ],
      },
    ],
  };
  
  export default quizData;