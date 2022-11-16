import React,{useEffect, useState} from "react";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
// import Add from "@material-ui/icons/Add";
import Paper from "@material-ui/core/Paper";
import axios from "axios"
import Image from "../assets/avatar1.jpeg"
import Image2 from "../assets/avatar.png"
import Image3 from "../assets/avatar2.jpeg"
import Image4 from "../assets/avatar2.png"
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
const customStyles = makeStyles(() => ({
  root: {
    padding: "13px",
  },
  storiesHeader: {
    fontSize: "13px",
    color: "blue",
  },
  storiesDiv: {
    overflowX: "auto",
    overflowY: "hidden",
    whiteSpace: "nowrap",
  },
  storyAvatar: {
    display: "inline-block",
    marginRight: "12px",
    width: '47px',
    height: '47px',
    border: '2px solid #8181e2'
  },
}));
var stompClient =null;
function Stories() {
  const [rooms, setRooms] = useState([]);
  const styles = customStyles();
  axios.defaults.headers.get['Authorization'] = `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJiaWdjcmVhbSIsImlhdCI6MTY2ODYwMjE3OSwiZXhwIjoxNjY5MjA2OTc5fQ.9UiihLjC0MnaKWMACPhEdzg4xo0FuTZnSPlkmmQ3_aW0js75bfOWMps84l1saT8yoz-U7M_rQGvcK7W8bbiT6g`;
  const stories = [Image2, Image3, Image4, Image, Image4, Image2, Image, Image3];
  useEffect(() => {
    axios.get(`http://localhost:8080/api/v1/room-available`)
    .then(res => {
      setRooms(res.data);
    })
    console.log('useEffect has been called!');
  }, []);
  const [privateChats, setPrivateChats] = useState(new Map());     
  const [publicChats, setPublicChats] = useState([]);
  const [roomId, setRoomId] = useState(0); 
  const [tab,setTab] =useState("CHATROOM");
  const [userData, setUserData] = useState({
      username: '',
      receivername: '',
      connected: false,
      message: ''
    });
  useEffect(() => {
    console.log(userData);
  }, [userData]);

  const connect =()=>{
      let Sock = new SockJS('http://localhost:8080/ws');
      stompClient = over(Sock);
      stompClient.connect({},onConnected, onError);
  }

  const onConnected = () => {
      userCreateRoom();
      setUserData({...userData,"connected": true});
      stompClient.subscribe('/chatroom/public', onMessageReceived);
      stompClient.subscribe('/user/'+userData.username+'/private', onPrivateMessage);
      userJoin();
  }

  const userJoin=()=>{
        var chatMessage = {
          senderName: userData.username,
          status:"JOIN"
        };
        stompClient.send("/app/join-room", {}, JSON.stringify(chatMessage));
  }

  const userCreateRoom=()=>{
      var chatMessage = {
        senderName: userData.username,
        status:"CREATE_ROOM",
        roomId: roomId
      };
      stompClient.send("/app/create-room", {}, JSON.stringify(chatMessage));
      setRoomId(roomId + 1);
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

  const handleMessage =(event)=>{
      const {value}=event.target;
      setUserData({...userData,"message": value});
  }
  const sendValue=()=>{
          if (stompClient) {
            var chatMessage = {
              senderName: userData.username,
              message: userData.message,
              status:"MESSAGE"
            };
            console.log(chatMessage);
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData({...userData,"message": ""});
          }
  }

  const sendPrivateValue=()=>{
      if (stompClient) {
        var chatMessage = {
          senderName: userData.username,
          receiverName:tab,
          message: userData.message,
          status:"MESSAGE"
        };
        
        if(userData.username !== tab){
          privateChats.get(tab).push(chatMessage);
          setPrivateChats(new Map(privateChats));
        }
        stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
        setUserData({...userData,"message": ""});
      }
  }

  const handleUsername=(event)=>{
      const {value}=event.target;
      setUserData({...userData,"username": value});
  }

  const registerUser=()=>{
      connect();
  }

  return (
    <Paper>
      <div className={styles.root}>
        <h1 className={styles.storiesHeader}> Short Stories</h1>
        <div className={styles.storiesDiv}>
          {stories.map((story, k) => (
            <Avatar variant="circular" src={story} className={styles.storyAvatar} key={k} align="center">
        
            </Avatar>
          ))}
          {rooms.map(room =>
              <tr key={room.chatRoomId}>
                  <td>{room.chatRoomId}</td>
              </tr>
          )}
                <button type="button" onClick={registerUser}>
                    connect
              </button> 
        </div>
      </div>
    </Paper>
  );
}

export default Stories;
