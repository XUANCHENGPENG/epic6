import React,{useState}  from 'react'
import { poseInstructions } from '../../utils/data'
import { poseImages } from '../../utils/pose_images'
import './DropDown.css'

export default function DropDown({poseList, currentPose, setCurrentPose}) {
const [instructions, setInsntructions] = useState(poseInstructions)
return (
        <div className='dropdown dropdown-container'>
            <ul id = 'nav'>
                {poseList.map((pose) => (
                    <li onClick={() => setCurrentPose(pose)}>
                        <p>{pose}</p>
                        <img src={poseImages[pose]} className="dropdown-img"/>
                    </li>
                ))}
            </ul>
            <ul className="instructions-list">
                <h1 style={{ color: 'white' }}> Selected Pose {currentPose} </h1>
                {instructions[currentPose].map((instruction) => {
                    return(
                        <li className="instruction">{instruction}</li>
                    )
                })}
            </ul>
                <img className="pose-demo-img" src={poseImages[currentPose]}/>
        </div>
        
    )
}
 