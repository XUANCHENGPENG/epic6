import React from 'react'
import {Link} from 'react-router-dom'
import './Tutorials.css'

import { tutorials, fixCamera } from '../../utils/data'

export default function Tutorials() {
    return (        
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
            <h1 className="tutorials-heading">Basic Tutorials</h1>
            <div className="tutorials-content-container">
                {tutorials.map((tutorial) => (
                    <p className="tutorials-content">{tutorial}</p>
                ))}
            </div>
            <h1 className="tutorials-heading">Camera Not Working?</h1>
            <div className="tutorials-content-container">
                {fixCamera.map((points) => (
                    <p className="tutorials-content">{points}</p>
                ))}
            </div>
        </div>
    )
}
