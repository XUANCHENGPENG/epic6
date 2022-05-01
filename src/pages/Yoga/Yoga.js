import React, { useRef, useState, useEffect } from 'react'
import './Yoga.css'
import {Link} from 'react-router-dom'
import DropDown from '../../components/DropDown/DropDown';


let poseList = ['Chair', 'Cobra', 'Dog', 'Tree', 'Warrior']

function Yoga(){

    const [currentPose, setCurrentPose] = useState('Chair')
    const [isStartPose, setIsStartPose] = useState(false)

    function startYoga(){
        setIsStartPose(true)
      } 













    return(
        <div className="home-container">
            <div className='home-header'>
                <h1 className='home-heading'>Pride Melbsports</h1>
                <Link to='/'>
                    <button 
                        className="btn btn-secondary" 
                        id="about-btn">
                        Home
                    </button>
                </Link>
            </div>
            <DropDown 
                poseList={poseList} 
                currentPose={currentPose} 
                setCurrentPose={setCurrentPose}/>
            <button onClick={startYoga} className="secondary-btn">Start Pose</button>
        </div>
    )
}
export default Yoga
