import React from 'react'
import Answers from '../components/Answers.jsx'
import QuizResult from '../components/QuizResult.jsx'
import axios from 'axios'

import API_URL from '../API_URL';


class QuizApp extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            questions: [
                {title: false},
            ],
            questionNumber: 1,
            points: 0,
            isEndTest: false,
            isShowResult: false,
            descriptionToResult: '',
            createdBy: ''
        }
    }

    restartQuiz(){
        this.setState({
            questions: [
                {title: false},
            ],
            questionNumber: 1,
            points: 0,
            isEndTest: false,
            isShowResult: false,
            createdBy: ''
        })

        const fetchQuiz = async () =>{
            await axios.get(`${API_URL}/quizzes/${this.props.id}`)
            .then(async res => {
                const quiz = res.data.quiz
                const userID = res.data.userID

                await axios.get(`${API_URL}/users/${userID}`)
                .then(res => {
                    this.setState({createdBy: res.data.username})
                })
                .catch(() => console.log('user not found'))

                await quiz.forEach((question,index) =>{
                    if(index === 0) return;

                    for(let i=question.answers.length-1; i>0; i--) {
                        let j = Math.floor(Math.random() * (i + 1));
                        let temp = question.answers[i];
                        question.answers[i] = question.answers[j];
                        question.answers[j] = temp;
                    }
                })

                this.setState({questions: quiz})
            })
            .catch(err =>{
                console.log(err, 'quiz not found')
            })
        }
        fetchQuiz()
    }

    componentWillMount(){
        this.restartQuiz()
    }


    nextQuestion(){
        const {questionNumber,questions, points} = this.state

        if(questionNumber >= questions.length - 1){
            if(points/(questions.length-1) === 1){
                this.setState({descriptionToResult: 'Not bad ! You are pretty smart'})
            }
            else if(points/(questions.length-1) >= 0.4){
                this.setState({descriptionToResult: 'Fine but you have to practice'})
            }
            else{
                this.setState({descriptionToResult: 'bad, you must practice'})
            }

            return this.setState({
                isEndTest: true,
            });
        }

        // toggle question to next
        this.setState({
            questionNumber: questionNumber + 1
        })
    }

    checkAnswer(answerArgument){
        const {questions, questionNumber, points} = this.state;

        // protection against to much cliks on answer
        if(questions[questionNumber].used){
            return console.log('to many tries')
        }

        // adding className to answer buttons
        questions[questionNumber].answers.forEach((item,index) => {
            this.setState(prevState => ({
                ...prevState.questions[questionNumber].answers[index].correctness =
                    item.answer === prevState.questions[questionNumber].correctAnswer ? 'bg-green-400' : 'bg-red-400'
            }))
        })


        // protection against to much cliks on answer
        this.setState(prevState =>({
            ...prevState.questions[questionNumber].used = true,
            points: answerArgument === questions[questionNumber].correctAnswer ? points + 1 : points,
        }))

        setTimeout(() =>{
            this.nextQuestion()
        },2000)
    }

    showResult(){
        this.setState({isShowResult: true})
    }




    render(){
      const {questions, points, questionNumber,isEndTest, isShowResult, descriptionToResult, createdBy} = this.state;

      return(
        <>
          {questions[0].title ?
            <div className="mt-12 md:mt-16 lg:mt-20 xl:mt-24 lg:flex lg:justify-center lg:items-center">
              {!isShowResult ?
                <div className=" w-3/4 p-4 m-auto lg:mt-auto pb-10 bg-green-200 rounded shadow-2xl ">
                  <h1 className="text-sm md:text-base lg:text-xl text-center font-light">
                    { questions[0].title } by { createdBy }
                  </h1>
                  <h1 className="text-sm md:text-base lg:text-xl text-center font-light">
                    { questionNumber } / { questions.length - 1 }
                  </h1>

                  <h1 className="text-lg md:text-xl lg:text-3xl text-center mt-12 uppercase">
                    {questions[questionNumber].question}?
                    <div className="p-4 border-b-4 border-green-300 opacity-50"></div>
                  </h1>
                  <div className="flex flex-col items-center mt-8">
                    {questions[questionNumber].answers.map(answer =>{
                      return (
                        <Answers
                          key={answer.answer}
                          answer={answer}
                          checkAnswer={() =>{ this.checkAnswer(answer.answer) }}
                        />
                      )
                    })}
                  </div>

                  { isEndTest ?
                    <div className="flex justify-center">
                      <button
                        className="create-quiz-button"
                        onClick={this.showResult.bind(this)}
                      >
                        Show results !
                      </button>
                    </div>
                  : null }
                </div>
              :null}

              {isShowResult ?
                  <QuizResult
                    points={ points }
                    questions={ questions }
                    descriptionToResult={ descriptionToResult }
                    restartQuiz={ this.restartQuiz.bind(this) }
                  />
              :null}
            </div>
          : null}
      </>
    )
  }
}

export default QuizApp