import React, { useRef, useState, useEffect } from 'react'
import './Yoga.css'
import {Link} from 'react-router-dom'
import DropDown from '../../components/DropDown/DropDown';
import Webcam from 'react-webcam'
// import * as poseDetection from '@tensorflow-models/pose-detection';
// import * as tf from '@tensorflow/tfjs';
// import { count } from '../../utils/music'; 
import { poseImages } from '../../utils/pose_images';
// import { POINTS, keypointConnections } from '../../utils/data';
// import { drawPoint, drawSegment } from '../../utils/helper'

let skeletonColor = 'rgb(255,255,255)'
let poseList = ['Chair', 'Cobra', 'Dog', 'Tree', 'Warrior']
let interval
let flag = false

function Yoga(){

    const [currentPose, setCurrentPose] = useState('Chair')
    const [isStartPose, setIsStartPose] = useState(false)
    const [startingTime, setStartingTime] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [poseTime, setPoseTime] = useState(0)
    const [bestPerform, setBestPerform] = useState(0)
    const webcamRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        const timeDiff = (currentTime - startingTime)/1000
        if(flag) {
          setPoseTime(timeDiff)
        }
        if((currentTime - startingTime)/1000 > bestPerform) {
          setBestPerform(timeDiff)
        }
      }, [currentTime])

    useEffect(() => {
        setCurrentTime(0)
        setPoseTime(0)
        setBestPerform(0)
    }, [currentPose])
    
    function startYoga(){
        setIsStartPose(true)
      } 
    function stopPose() {
        setIsStartPose(false)
        clearInterval(interval)
    }









    if(isStartPose) {
        return (
            <div className="home-container">
                <div className='home-header'>
                    <h1 className='home-heading'>Pride Melbsports</h1>
                </div>
                <div className="performance-container">
                    <div className="pose-performance">
                        <h4>Pose Time: {poseTime} s</h4>
                    </div>
                    <div className="pose-performance">
                        <h4>Best: {bestPerform} s</h4>
                    </div>
                </div>
                <div>
                    <Webcam width='640px' height='480px' id="webcam"
                        ref={webcamRef}
                        style={{ position: 'absolute',
                                left: 120,
                                top: 200,
                                padding: '0px',}}/>
                    <canvas ref={canvasRef} id="my-canvas" width='640px'
                            height='480px'
                            style={{ position: 'absolute',
                                    left: 120,
                                    top: 100,
                                    zIndex: 1}}>
                    </canvas>
                    <div>
                        <img src={poseImages[currentPose]} className="pose-img"/>
                    </div>
                </div>
                <button onClick={stopPose} className="secondary-btn">Stop Pose</button>
            </div>
            )
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
