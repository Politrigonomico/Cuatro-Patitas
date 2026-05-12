import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import app from '../../firebaseConfig';
import { globalStyles as styles } from '../../constants/globalStyles';
import { useFocusEffect } from 'expo-router';
import emailjs from '@emailjs/react-native';

export default function Perfil() {
  const { user, loading: authLoading, dni: dniHook, saveDni, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  
  const [dni, setDni] = useState('');
  const [editandoDni, setEditandoDni] = useState(false);
  const [misTramites, setMisTramites] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dniRegistro, setDniRegistro] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  
  // Estado para interceptar Google Login si falta DNI
  const [necesitaDni, setNecesitaDni] = useState(false);
  
  const db = getFirestore(app);

  const cargarMisDatos = React.useCallback(async (dniUser: string) => {
    setCargando(true);
    try {
      const resultados: any[] = [];
      const qCast = query(collection(db, 'Castraciones'), where("responsableDni", "==", dniUser));
      const snapCast = await getDocs(qCast);
      snapCast.forEach(docSnap => resultados.push({ id: docSnap.id, tipo: 'Castración', ...docSnap.data() }));

      const qAdop = query(collection(db, 'Solicitudes_Adopciones'), where("datosAdoptante.dni", "==", dniUser));
      const snapAdop = await getDocs(qAdop);
      snapAdop.forEach(docSnap => resultados.push({ id: docSnap.id, tipo: 'Adopción', ...docSnap.data() }));

      setMisTramites(resultados);
    } catch (error) { console.error(error); }
    finally { setCargando(false); }
  }, [db]);

  useEffect(() => {
    if (user && dniHook) {
      setDni(dniHook);
      cargarMisDatos(dniHook);
      setNecesitaDni(false);
    } else if (user && !dniHook && !authLoading) {
      setNecesitaDni(true);
      setCargando(false);
    } else if (!user && !authLoading) {
      setCargando(false);
      setNecesitaDni(false);
    }
  }, [user, dniHook, authLoading, cargarMisDatos]);

  const guardarDniPerfil = async () => {
    if (dni.length < 7) return Alert.alert("Error", "Ingresa un DNI válido.");
    try {
      await saveDni(dni);
      setEditandoDni(false);
      cargarMisDatos(dni);
      Alert.alert("¡Listo!", "DNI vinculado a tu cuenta.");
    } catch { Alert.alert("Error", "No se pudo guardar."); }
  };

  // LÓGICA PARA GUARDAR DNI TRAS LOGIN CON GOOGLE
  const guardarDniGoogle = async () => {
    if (!dniRegistro) return Alert.alert("Error", "El DNI es obligatorio.");
    setCargando(true);
    try {
      // 1. Verificar unicidad del DNI
      const qUsuarios = query(collection(db, 'Usuarios'), where("dni", "==", dniRegistro));
      const snapUsuarios = await getDocs(qUsuarios);
      
      if (!snapUsuarios.empty) {
        setCargando(false);
        return Alert.alert("Error", "El DNI ingresado ya está registrado con otra cuenta.");
      }

      // 2. Guardar en Firestore usando el hook (que ya actualiza estado)
      await saveDni(dniRegistro);

      // 3. Enviar correo con EmailJS
      try {
        const templateParams = {
          to_email: user.email,
          user_dni: dniRegistro,
          subject: '¡Bienvenido a Cuatro Patitas!'
        };

        await emailjs.send(
          'service_qiarh1e',
          'template_atixtzk',
          templateParams,
          { publicKey: 'UXNkFYGoFoOO86qS3' }
        );
        console.log('Correo enviado exitosamente');
      } catch (emailError) {
        console.error('Error al enviar correo:', emailError);
      }

      Alert.alert("¡Éxito!", "Perfil completado.");
      setNecesitaDni(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setCargando(false);
    }
  };

  // LÓGICA LOGIN EMAIL/CONTRASEÑA
  const handleAuth = async () => {
    if (!email || !password) return Alert.alert("Error", "Completa todos los campos");
    
    if (esRegistro && !dniRegistro) {
      return Alert.alert("Error", "El DNI es obligatorio para registrarse.");
    }

    setCargando(true);
    try {
      if (esRegistro) {
        // 1. Verificar si el DNI ya existe en Firestore
        const qUsuarios = query(collection(db, 'Usuarios'), where("dni", "==", dniRegistro));
        const snapUsuarios = await getDocs(qUsuarios);
        
        if (!snapUsuarios.empty) {
          setCargando(false);
          return Alert.alert("Error", "El DNI ingresado ya está registrado con otra cuenta.");
        }

        // 2. Crear usuario en Firebase Auth
        await signUp(email, password);

        // 3. Guardar en Firestore usando el hook
        await saveDni(dniRegistro);

        // 4. Enviar correo con EmailJS
        try {
          const templateParams = {
            to_email: email,
            user_dni: dniRegistro,
            subject: '¡Bienvenido a Cuatro Patitas!'
          };

          await emailjs.send(
            'service_qiarh1e',
            'template_atixtzk',
            templateParams,
            { publicKey: 'UXNkFYGoFoOO86qS3' }
          );
          console.log('Correo enviado exitosamente');
        } catch (emailError) {
          console.error('Error al enviar correo:', emailError);
        }

        Alert.alert("¡Éxito!", "Cuenta creada correctamente.");
      } else {
        await signIn(email, password);
      }
    } catch (error: any) { 
      Alert.alert("Error", error.message); 
    } finally { 
      setCargando(false); 
    }
  };

  // LÓGICA LOGIN GOOGLE
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert("Error con Google", error.message);
    }
  };

  const cerrarSesion = async () => {
    await signOut();
    setDni(''); setMisTramites([]); setEmail(''); setPassword(''); setDniRegistro(''); setNecesitaDni(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect( React.useCallback(() => { if (dni) cargarMisDatos(dni); }, [dni]) );

  // VISTA BLOQUEANTE PARA GOOGLE LOGIN SIN DNI
  if (user && necesitaDni) {
    return (
      <View style={localStyles.containerLogin}>
        <View style={localStyles.tarjetaLogin}>
          <Text style={localStyles.tituloLogin}>Completa tu Perfil</Text>
          <Text style={localStyles.subtituloLogin}>Para continuar, por favor ingresa tu DNI. Este campo es inmutable.</Text>
          
          <TextInput style={localStyles.inputLogin} placeholder="DNI" keyboardType="numeric" value={dniRegistro} onChangeText={setDniRegistro} />

          <TouchableOpacity style={localStyles.botonLogin} onPress={guardarDniGoogle} disabled={cargando}>
            {cargando ? <ActivityIndicator color="white" /> : <Text style={localStyles.textoBotonLogin}>Guardar y Continuar</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={cerrarSesion}>
            <Text style={{color: '#ef4444', fontWeight: '600'}}>Cancelar y Salir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={localStyles.containerLogin}>
        <View style={localStyles.tarjetaLogin}>
          <Text style={localStyles.tituloLogin}>{esRegistro ? 'Crear Cuenta' : 'Inicia Sesión'}</Text>
          <Text style={localStyles.subtituloLogin}>Debes estar conectado para gestionar tus adopciones y turnos.</Text>
          
          <TextInput style={localStyles.inputLogin} placeholder="Correo electrónico" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextInput style={localStyles.inputLogin} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
          
          {esRegistro && (
            <TextInput style={localStyles.inputLogin} placeholder="DNI (Inmutable)" keyboardType="numeric" value={dniRegistro} onChangeText={setDniRegistro} />
          )}

          <TouchableOpacity style={localStyles.botonLogin} onPress={handleAuth} disabled={cargando}>
            {cargando ? <ActivityIndicator color="white" /> : <Text style={localStyles.textoBotonLogin}>{esRegistro ? 'Registrarse' : 'Ingresar con Correo'}</Text>}
          </TouchableOpacity>

          {/* BOTÓN DE GOOGLE */}
          <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
            <View style={{flex: 1, height: 1, backgroundColor: '#e2e8f0'}} />
            <Text style={{width: 50, textAlign: 'center', color: '#94a3b8'}}>o</Text>
            <View style={{flex: 1, height: 1, backgroundColor: '#e2e8f0'}} />
          </View>

          <TouchableOpacity style={localStyles.botonGoogle} onPress={handleGoogleLogin}>
            <Text style={localStyles.textoGoogle}>G</Text>
            <Text style={localStyles.textoBotonGoogle}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{marginTop: 25, alignItems: 'center'}} onPress={() => setEsRegistro(!esRegistro)}>
            <Text style={localStyles.linkLogin}>{esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={localStyles.headerPerfil}>
        <View>
          <Text style={localStyles.tituloPerfil}>Mi Perfil</Text>
          <Text style={{color: '#e0e7ff', marginTop: 2}}>{user.email}</Text>
        </View>
        <TouchableOpacity onPress={cerrarSesion} style={localStyles.botonSalir}>
          <Text style={{color: 'white', fontSize: 13, fontWeight: 'bold'}}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={localStyles.contenidoPerfil}>
        <View style={localStyles.cajaDni}>
          <Text style={localStyles.label}>DNI vinculado:</Text>
          {editandoDni ? (
            <View style={{flexDirection: 'row', marginTop: 5}}>
              <TextInput style={[localStyles.inputLogin, {flex: 1, marginBottom: 0, padding: 10}]} placeholder="Tu DNI" keyboardType="numeric" value={dni} onChangeText={setDni} />
              <TouchableOpacity style={localStyles.botonChico} onPress={guardarDniPerfil}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={{fontSize: 22, fontWeight: 'bold', color: '#1e293b'}}>{dni}</Text>
              <TouchableOpacity onPress={() => setEditandoDni(true)}>
                <Text style={{color: '#4f46e5', fontWeight: 'bold'}}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#334155', marginBottom: 15}}>Mis Gestiones</Text>
        
        {cargando ? <ActivityIndicator size="large" color="#4f46e5" /> : (
          misTramites.length === 0 ? (
            <Text style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No tienes mascotas o turnos registrados.</Text>
          ) : (
            misTramites.map((item) => (
              <View key={item.id} style={styles.tarjeta}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                  <Text style={{fontWeight: 'bold', color: '#4338ca', fontSize: 16}}>{item.tipo}</Text>
                  <Text style={localStyles.badgeEstado}>{item.estadoTurno || item.estadoSolicitud}</Text>
                </View>
                <Text style={{fontSize: 18, color: '#1e293b'}}>{item.animalNombre}</Text>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  containerLogin: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#e0e7ff' },
  tarjetaLogin: { backgroundColor: 'white', width: '100%', maxWidth: 400, padding: 30, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  tituloLogin: { fontSize: 26, fontWeight: 'bold', color: '#3730a3', textAlign: 'center', marginBottom: 10 },
  subtituloLogin: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 25 },
  inputLogin: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 15, color: '#334155' },
  botonLogin: { backgroundColor: '#4f46e5', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  textoBotonLogin: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  botonGoogle: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  textoGoogle: { color: '#ea4335', fontWeight: 'bold', fontSize: 20, marginRight: 10 },
  textoBotonGoogle: { color: '#334155', fontSize: 16, fontWeight: 'bold' },
  linkLogin: { color: '#4f46e5', fontWeight: '600', fontSize: 14 },
  headerPerfil: { backgroundColor: '#4f46e5', padding: 25, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  tituloPerfil: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  botonSalir: { backgroundColor: '#4338ca', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  contenidoPerfil: { padding: 20 },
  cajaDni: { backgroundColor: 'white', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 25 },
  label: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 5 },
  botonChico: { backgroundColor: '#4f46e5', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 10, marginLeft: 10 },
  badgeEstado: { backgroundColor: '#e0e7ff', color: '#4338ca', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' }
});