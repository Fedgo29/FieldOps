import React, { useEffect, useState } from 'react';
import {
 ActivityIndicator, Alert, Button, FlatList, SafeAreaView, ScrollView,
 StyleSheet, Text, TextInput, View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

const API_URL=process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
type User={sub:string;email:string;role:'ADMIN'|'SUPERVISOR'|'TECHNICIAN'};
type Order={id:string;title:string;description:string|null;status:string;priority:string;created_at:string};
type LoginResult={accessToken:string;user:User};

export default function App(){
 const [token,setToken]=useState('');
 const [user,setUser]=useState<User|null>(null);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [orders,setOrders]=useState<Order[]>([]);
 const [title,setTitle]=useState('');
 const [description,setDescription]=useState('');
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState('');
 const [report,setReport]=useState('');
 useEffect(()=>{void (async()=>{
  const saved=await SecureStore.getItemAsync('accessToken');
  if(!saved)return;
  try{
   const resp=await fetch(API_URL+'/auth/me',{headers:{Authorization:'Bearer '+saved}});
   if(!resp.ok)throw new Error();
   setToken(saved);setUser(await resp.json());
  }catch{await SecureStore.deleteItemAsync('accessToken');}
 })();},[]);
 async function request(path:string,options:RequestInit={}){
  const response=await fetch(API_URL+path,{...options,headers:{
   'content-type':'application/json',Authorization:'Bearer '+token,...options.headers
  }});
  const body=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(body?.message instanceof Array?body.message.join(', '):body?.message||'HTTP '+response.status);
  return body;
 }
 async function login(){
  setLoading(true);setMessage('');
  try{
   const response=await fetch(API_URL+'/auth/login',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({email,password})
   });
   const body=await response.json();
   if(!response.ok)throw new Error(body.message||'Login failed');
   const auth=body as LoginResult;
   await SecureStore.setItemAsync('accessToken',auth.accessToken);
   setToken(auth.accessToken);setUser(auth.user);setPassword('');
  }catch(error){setMessage(String(error));}
  finally{setLoading(false);}
 }
 async function load(){
  setLoading(true);setMessage('');
  try{setOrders(await request('/work-orders'));}
  catch(error){setMessage(String(error));}
  finally{setLoading(false);}
 }
 useEffect(()=>{if(token)void load();},[token]);
 async function create(){
  try{
   await request('/work-orders',{method:'POST',body:JSON.stringify({title,description})});
   setTitle('');setDescription('');await load();
  }catch(error){Alert.alert('Error',String(error));}
 }
 async function setStatus(order:Order){
  const next=order.status==='PENDING'?'IN_PROGRESS':order.status==='IN_PROGRESS'?'COMPLETED':null;
  if(!next)return;
  try{await request('/work-orders/'+order.id,{method:'PATCH',body:JSON.stringify({status:next})});await load();}
  catch(error){Alert.alert('Error',String(error));}
 }
 async function getReport(){
  try{
   const data=await request('/reports/overview');
   setReport(JSON.stringify(data,null,2));
  }catch(error){Alert.alert('Error',String(error));}
 }
 async function logout(){
  await SecureStore.deleteItemAsync('accessToken');setToken('');setUser(null);setOrders([]);setReport('');
 }
 return <SafeAreaView style={styles.root}><StatusBar style="auto"/>
  <ScrollView contentContainerStyle={styles.content}>
   <Text style={styles.heading}>FieldOps</Text>
   <Text style={styles.subtitle}>Gestión de órdenes de trabajo</Text>
   {!user?
    <View style={styles.card}>
     <Text style={styles.h2}>Acceso</Text>
     <TextInput style={styles.input} placeholder="Correo" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
     <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword}/>
     <Button title="Entrar" onPress={()=>void login()} disabled={loading}/>
    </View>:
    <>
     <Text>{user.email} · {user.role}</Text>
     <View style={styles.actions}><Button title="Actualizar órdenes" onPress={()=>void load()}/><Button title="Salir" onPress={()=>void logout()}/></View>
     {user.role!=='TECHNICIAN'&&<View style={styles.card}>
      <Text style={styles.h2}>Crear orden</Text>
      <TextInput style={styles.input} value={title} placeholder="Título (mínimo 5 caracteres)" onChangeText={setTitle}/>
      <TextInput style={styles.input} value={description} placeholder="Descripción" onChangeText={setDescription} multiline/>
      <Button title="Crear" disabled={title.trim().length<5} onPress={()=>void create()}/>
     </View>}
     <Text style={styles.h2}>Órdenes ({orders.length})</Text>
     {orders.map(o=><View key={o.id} style={styles.card}>
      <Text style={styles.h2}>{o.title}</Text>
      <Text>{o.priority} · {o.status}</Text>
      {!!o.description&&<Text>{o.description}</Text>}
      {(o.status==='PENDING'||o.status==='IN_PROGRESS')&&
       <Button title={o.status==='PENDING'?'Iniciar':'Completar'} onPress={()=>void setStatus(o)}/>}
     </View>)}
     {user.role!=='TECHNICIAN'&&<View style={styles.card}>
      <Button title="Ver reporte" onPress={()=>void getReport()}/>
      {!!report&&<Text selectable>{report}</Text>}
     </View>}
    </>}
   {loading&&<ActivityIndicator size="large"/>}
   {!!message&&<Text style={styles.error}>{message}</Text>}
  </ScrollView>
 </SafeAreaView>;
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:'#f3f6fa'},
 content:{padding:20,gap:14},
 heading:{fontSize:32,fontWeight:'800',color:'#153c57'},
 subtitle:{color:'#52616c',marginBottom:10},
 h2:{fontSize:18,fontWeight:'700',marginBottom:10,color:'#172f42'},
 card:{backgroundColor:'white',borderRadius:14,padding:16,gap:10,borderWidth:1,borderColor:'#dfe6eb'},
 input:{borderWidth:1,borderColor:'#c6d0db',borderRadius:8,padding:12,backgroundColor:'#fff'},
 actions:{flexDirection:'row',justifyContent:'space-between'},
 error:{color:'#aa2233'},
});
