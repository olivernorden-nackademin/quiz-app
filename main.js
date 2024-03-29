class Quiz {
    constructor() {
        this.questions = [];
        this.userName = '';
        this.selectedNumberOfQuestions = 0;
        this.currentQuestionIdx = 0;
        this.score = 0;
        this.correctSelectScore = 1;
        this.incorrectSelectScore = -1;
        this.parentElement = document.getElementById('root');
        this.getQuestions()
            .then(this.renderMenu.bind(this))
            .catch(err => alert('Something went wrong...'));
    }

    getQuestions() {
        return fetch('./questions.php')
            .then(res => res.json())
                .then(questions => {
                    questions.forEach(question => 
                        this.questions.push(new Question(question))
                    )
                });
    }

    toggleAnswerSelected(answer) {
        const curQuestIdx = this.currentQuestionIdx;
        this.questions[curQuestIdx].answers[answer].selected = !this.questions[curQuestIdx].answers[answer].selected;
    }

    incrementQuestion(inc) {
        this.currentQuestionIdx += inc;
        this.renderQuestion();
    }

    startQuiz(menuDivid) {
        // Slice questions array to user desired length
        this.questions = this.questions.slice(0, this.selectedNumberOfQuestions);

        // Remove menu
        const menu = document.getElementById(menuDivid);
        menu.parentElement.removeChild(menu);

        this.renderQuestion();
    }

    possibleScore() {
        return this.questions.reduce((quizScore, question) => {
            // Loop through answers and accumulate score
            const questionScore = question.answers.reduce((questionScore, answer) => {
                return (answer.correct) ? questionScore + this.correctSelectScore : questionScore; // Answer is correct
            }, 0);
            return quizScore + questionScore;
        }, 0);
    }

    correctQuiz() {
        // Loop through questions and accumulate score
        const quizScore = this.questions.reduce((quizScore, question) => {

            // Loop through answers and accumulate score
            const questionScore = question.answers.reduce((questionScore, answer) => {
                const { correct, selected } = answer;
                if (correct && selected) return questionScore + this.correctSelectScore; // Correct answer selected
                if (!correct && !selected) return questionScore; // Wrong answer not selected 
                if (correct !== selected) return questionScore + this.incorrectSelectScore; // Wrong answer selected or correct answer not selected
            }, 0);

            return quizScore + questionScore;
        }, 0);

        alert(`${this.userName} scored ${quizScore} point(s) of ${this.possibleScore()} possible`);
        this.score = quizScore;
    }

    handleMenuInput(e) {
        const { name, value } = e.target;
        this[name] = value;
    }

    renderMenu() {

        const parentElement = this.parentElement;

        // Create menu div
        const menuContainerId = 'quizMenu';
        let menuDiv = document.createElement('div');
        menuDiv.id = menuContainerId;
        menuDiv.classList.add('container');

        // Name form group
        {
            // Form group
            let nameFormGroup = document.createElement('div');
            nameFormGroup.classList.add('form-group');

            // Name field label
            const nameFieldId = 'userName';
            let nameFieldLabel = document.createElement('label');
            nameFieldLabel.textContent = 'Your name';
            nameFieldLabel.for = nameFieldId;
            nameFormGroup.appendChild(nameFieldLabel);

            // Name field
            let nameField = document.createElement('input');
            nameField.name = 'userName';
            nameField.id = nameFieldId;
            nameField.classList.add('form-control');
            nameField.addEventListener('change', this.handleMenuInput.bind(this));
            nameFormGroup.appendChild(nameField);

            menuDiv.appendChild(nameFormGroup);
        }

        // Question range input and label
        {
            const noOfQuestions = this.questions.length; // To be set dynamicaly from question api
            const rangeDefault = Math.round(noOfQuestions/2);
            this.selectedNumberOfQuestions = rangeDefault; // Default number of questions
            const questionRangeId = 'questionRange';

            let rangeContainer = document.createElement('div');
            rangeContainer.classList.add('form-group');

            let questionRange = document.createElement('input');
            questionRange.type = 'range';
            questionRange.id = questionRangeId;
            questionRange.classList.add('custom-range');
            questionRange.name = 'selectedNumberOfQuestions';

            // Value parameters
            questionRange.min = 1;
            questionRange.max = noOfQuestions;
            questionRange.value = rangeDefault;

            // Label updating
            questionRange.addEventListener('input', function() {
                this.previousSibling.children[0].textContent = this.value;
            });

            // State update
            questionRange.addEventListener('change', this.handleMenuInput.bind(this))

            // Label 
            let questionRangeLabel = document.createElement('label');
            questionRangeLabel.for = questionRangeId;
            questionRangeLabel.textContent = ' Questions';

            // Range value holder
            let rangeValueHolder = document.createElement('span');
            rangeValueHolder.textContent = rangeDefault;
            questionRangeLabel.prepend(rangeValueHolder);

            rangeContainer.appendChild(questionRangeLabel);
            rangeContainer.appendChild(questionRange);
            menuDiv.appendChild(rangeContainer);

        }

        // Start quiz button
        let startButton = document.createElement('button');
        startButton.addEventListener('click', this.startQuiz.bind(this, menuContainerId));
        startButton.textContent = 'Start quiz';
        startButton.classList.add('btn', 'btn-primary', 'btn-block');
        menuDiv.appendChild(startButton);

        // Append menu div
        parentElement.appendChild(menuDiv);
    }

    renderQuestion() {

        // Get current question and answers
        const { question, answers } = this.questions[this.currentQuestionIdx]; 

        const parentElement = this.parentElement;

        // Create question div
        const questionContainerId = 'question';
        let questionDiv = document.getElementById(questionContainerId) || document.createElement('div'); // Create new container if one does not exist
        questionDiv.id = questionContainerId;
        questionDiv.classList.add('container');

        // Question card
        let questionCard = document.createElement('div');
        questionCard.classList.add('card');

        // Clear any existing question
        while (questionDiv.firstChild){
            questionDiv.removeChild(questionDiv.firstChild);
        }  
        
        // Create question info (Card Header)
        let questionInfo = document.createElement('h1');
        questionInfo.classList.add('card-header');
        questionInfo.textContent = `Question ${this.currentQuestionIdx + 1} of ${this.selectedNumberOfQuestions}`;
        questionCard.appendChild(questionInfo);

        // Question card body
        let questionCardBody = document.createElement('div');
        questionCardBody.classList.add('card-body');

        // Create question paragraph
        let questionEl = document.createElement('p');
        questionEl.textContent = question;
        questionCardBody.appendChild(questionEl);

        // Answers container
        let answersContainer = document.createElement('div');
        answersContainer.classList.add('form-checkboxes');

        // Create answer elements
        answers.forEach((answer, idx) => {
            //Answer container
            let answerContainer = document.createElement('div');
            answerContainer.classList.add('form-check');

            // AnswerId (For label binding)
            const answerId = `q${this.currentQuestionIdx}a${idx}`

            // Answer checkbox
            let answerCheckbox = document.createElement('input');
            answerCheckbox.type = 'checkbox';
            answerCheckbox.id = answerId;
            answerCheckbox.classList.add('form-check-input');
            answerCheckbox.checked = answer.selected;
            answerCheckbox.addEventListener('change', this.toggleAnswerSelected.bind(this, idx)); // Add event listener to toggle selected propery of answer

            // Answer label
            let answerLabel = document.createElement('label');
            answerLabel.setAttribute('for', answerId);
            answerLabel.classList.add('form-check-label');
            answerLabel.textContent = answer.answer;

            // Appending children
            answerContainer.appendChild(answerCheckbox);
            answerContainer.appendChild(answerLabel);

            answersContainer.appendChild(answerContainer);
            
        });

        // Append answers container
        questionCardBody.appendChild(answersContainer);

        // Button container
        let btnContainer = document.createElement('div');
        btnContainer.classList.add('block-btn-container');

        // Previous question button
        let prevQuestionBtn = document.createElement('button');
        prevQuestionBtn.textContent = '<- Prev question';
        prevQuestionBtn.addEventListener('click', this.incrementQuestion.bind(this, -1));
        prevQuestionBtn.disabled = !this.currentQuestionIdx; // Disable button if current question index is 0
        prevQuestionBtn.classList.add('btn', 'btn-secondary', 'btn-block');
        btnContainer.appendChild(prevQuestionBtn);

        // Create next question button or correct quiz button
        if (this.currentQuestionIdx === this.questions.length - 1){
            // Correct quiz button
            let correctQuizBtn = document.createElement('button');
            correctQuizBtn.textContent = 'Correct quiz';
            correctQuizBtn.classList.add('btn', 'btn-success', 'btn-block');
            correctQuizBtn.addEventListener('click', this.correctQuiz.bind(this));
            btnContainer.appendChild(correctQuizBtn);
        }
        else{
            // Next question button
            let nextQuestionBtn = document.createElement('button');
            nextQuestionBtn.textContent = 'Next question ->';
            nextQuestionBtn.classList.add('btn', 'btn-primary', 'btn-block');
            nextQuestionBtn.addEventListener('click', this.incrementQuestion.bind(this, 1));
            btnContainer.appendChild(nextQuestionBtn);
        }

        // Append buttons to card body
        questionCardBody.appendChild(btnContainer);

        // Append question and answers
        questionCard.appendChild(questionCardBody);
        questionDiv.appendChild(questionCard);
        parentElement.appendChild(questionDiv);

    }
}

class Question {
    constructor(questionObj){
        const { question, category, answers } = questionObj;
        this.question = question;
        this.category = category;
        this.answers = answers;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});