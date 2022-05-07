import React, { useRef, useState, useEffect } from 'react'
import './Yoga.css'
import {Link} from 'react-router-dom'
import DropDown from '../../components/DropDown/DropDown';
import Webcam from 'react-webcam'
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import { count } from '../../utils/music'; 
import { poseImages } from '../../utils/pose_images';
import { POINTS, keypointConnections } from '../../utils/data';
import { drawPoint, drawSegment } from '../../utils/helper'

let skeletonColor = 'rgb(255,255,255)'
let poseList = ['Chair', 'Cobra', 'Dog','Tree','Warrior']
  
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
        runMovenet()
      } 
    function stopPose() {
        setIsStartPose(false)
        clearInterval(interval)
    }
    const CLASS_NO = {
        Chair: 0,
        Cobra: 1,
        Dog: 2,
        Tree: 3,
        Warrior: 4,}

    function get_center_point(landmarks, left_bodypart, right_bodypart) {
        let left = tf.gather(landmarks, left_bodypart, 1)
        let right = tf.gather(landmarks, right_bodypart, 1)
        const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))
        return center
    }

    function get_pose_size(landmarks, torso_size_multiplier=2.5) {
        let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        let shoulders_center = get_center_point(landmarks,POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
        let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
        let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        pose_center_new = tf.expandDims(pose_center_new, 1)
    
        pose_center_new = tf.broadcastTo(pose_center_new,
            [1, 17, 2]
          )
          // return: shape(17,2)
        let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
        let max_dist = tf.max(tf.norm(d,'euclidean', 0))
    
        // normalize scale
        let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
        return pose_size
      }
  
    function normalize_pose_landmarks(landmarks) {
        let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
        pose_center = tf.expandDims(pose_center, 1)
        pose_center = tf.broadcastTo(pose_center, 
            [1, 17, 2]
            )
        landmarks = tf.sub(landmarks, pose_center)

        let pose_size = get_pose_size(landmarks)
        landmarks = tf.div(landmarks, pose_size)
        return landmarks
    }

    function landmarks_to_embedding(landmarks) {
        // normalize landmarks 2D
        landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0))
        let embedding = tf.reshape(landmarks, [1,34])
        return embedding
    }
    
    const runMovenet = async () => {
        const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        const poseClassifier = await tf.loadLayersModel('https://epic1.s3.ap-southeast-2.amazonaws.com/model.json')
        const countAudio = new Audio(count)
        countAudio.loop = true
        interval = setInterval(() => { 
            detectPose(detector, poseClassifier, countAudio)
        }, 100)
    }

    const detectPose = async (detector, poseClassifier, countAudio) => {
        if (
          typeof webcamRef.current !== "undefined" &&
          webcamRef.current !== null &&
          webcamRef.current.video.readyState === 4
        ) {
          let notDetected = 0 
          const video = webcamRef.current.video
          const pose = await detector.estimatePoses(video)
          const ctx = canvasRef.current.getContext('2d')
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          try {
            const keypoints = pose[0].keypoints 
            let input = keypoints.map((keypoint) => {
              if(keypoint.score > 0.4) {
                if(!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
                  drawPoint(ctx, keypoint.x, keypoint.y, 8, 'rgb(255,255,255)')
                  let connections = keypointConnections[keypoint.name]
                  try {
                    connections.forEach((connection) => {
                      let conName = connection.toUpperCase()
                      drawSegment(ctx, [keypoint.x, keypoint.y],
                          [keypoints[POINTS[conName]].x,
                           keypoints[POINTS[conName]].y]
                      , skeletonColor)
                    })
                  } catch(err) {
    
                  }
                  
                }
              } else {
                notDetected += 1
              } 
              return [keypoint.x, keypoint.y]
            }) 
            if(notDetected > 4) {
              skeletonColor = 'rgb(255,255,255)'
              return
            }
            const processedInput = landmarks_to_embedding(input)
            const classification = poseClassifier.predict(processedInput)
    
            classification.array().then((data) => {         
              const classNo = CLASS_NO[currentPose]
              console.log(data[0][classNo])
              if(data[0][classNo] > 0.97) {
                
                if(!flag) {
                  countAudio.play()
                  setStartingTime(new Date(Date()).getTime())
                  flag = true
                }
                setCurrentTime(new Date(Date()).getTime()) 
                skeletonColor = 'rgb(0,255,0)'
              } else {
                flag = false
                skeletonColor = 'rgb(255,255,255)'
                countAudio.pause()
                countAudio.currentTime = 0
              }
            })
          } catch(err) {
            console.log(err)
          }
          
          
        }
      }

    if(isStartPose) {
        return (
            <div className="home-container">
                <div className='home-header'>
                    <h1 className='home-heading'>Pride Melbsports</h1>
                    <button onClick={stopPose} className="btn start-btn">Stop Pose</button>
                    <Link to='/'>
                    <button 
                        className="btn btn-secondary" 
                        id="about-btn">
                        Home
                    </button>
                </Link>
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
                        style={{position: 'absolute',
                                left: 100,
                                top: 200,
                                padding: '0px',}}/>
                    <canvas ref={canvasRef} id="my-canvas" width='640px'
                            height='480px'
                            style={{position: 'absolute',
                                    left: 100,
                                    top: 200,
                                    zIndex: 1}}>
                    </canvas>
                    <div>
                        <img src={poseImages[currentPose]} className="pose-img"/>
                    </div>
                </div>
            </div>
            )
    }


    return(
        <div className="home-container">
            <div className='home-header'>
                <h1 className='home-heading'>Yoga Trainer</h1>
                <button onClick={startYoga} className="btn start-btn">Start Pose</button>
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
            <div className='home-bottom'>
                <h1 className='home-heading'>Pride Melbsports</h1>
            </div>
        </div>
    )
}
export default Yoga
