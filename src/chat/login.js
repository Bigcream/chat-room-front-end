import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import "./assets/login.css";
import { useHistory } from "react-router-dom";
const stompClient = null;
const Login = () => {
    const history = useHistory();
    
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]);
    const [roomId, setRoomId] = useState(0); 
    const [tab,setTab] =useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        password: ''
      });

    const handleSubmit =() => {
      axios
        .post("http://localhost:8080/api/v1/login", {username: userData.username, password: userData.password})
        .then(response => {
          localStorage.setItem("username", userData.username);
          localStorage.setItem("token", response.data);
          history.push("/");

        })
        .catch(error => {
          console.log(error);
        });
    };

    const registerUser=()=>{
      connect();
  }

    const handleUsername=(event)=>{
      const {value}=event.target;
      setUserData({...userData,"username": value});
    }

    const handlePassword=(event)=>{
      const {value}=event.target;
      setUserData({...userData,"password": value});
    }

    const connect =()=>{
      let Sock = new SockJS('http://localhost:8080/ws');
      stompClient = over(Sock);
      stompClient.connect({},onConnected, onError);
  }
  const onMessageReceived = (payload)=>{
    var payloadData = JSON.parse(payload.body);
    switch(payloadData.status){
        case "JOIN":
            if(!privateChats.get(payloadData.senderName)){
                privateChats.set(payloadData.senderName,[]);
                setPrivateChats(new Map(privateChats));
            }
            break;
        case "MESSAGE":
            publicChats.push(payloadData);
            setPublicChats([...publicChats]);
            break;
    }
}

  const onPrivateMessage = (payload)=>{
      console.log(payload);
      var payloadData = JSON.parse(payload.body);
      if(privateChats.get(payloadData.senderName)){
          privateChats.get(payloadData.senderName).push(payloadData);
          setPrivateChats(new Map(privateChats));
      }else{
          let list =[];
          list.push(payloadData);
          privateChats.set(payloadData.senderName,list);
          setPrivateChats(new Map(privateChats));
      }
  }

  const onError = (err) => {
      console.log(err);
      
}

  const onConnected = () => {
      setUserData({...userData,"connected": true});
      stompClient.subscribe('/chatroom/public', onMessageReceived);
      stompClient.subscribe('/user/'+userData.username+'/private', onPrivateMessage);
  }
    return (
        <div className="register" onSubmit={handleSubmit}>
            <input
                id="user-name"
                placeholder="Enter your name"
                name="userName"
                value={userData.username}
                onChange={handleUsername}
                margin="normal"
              />
              <input
              type="password"
                id="user-name"
                placeholder="Enter your password"
                name="password"
                value={userData.password}
                onChange={handlePassword}
                margin="normal"
              />
              <button type="button" onClick={handleSubmit}>
                    Login
              </button> 
        </div>
    )
}

export default Login
