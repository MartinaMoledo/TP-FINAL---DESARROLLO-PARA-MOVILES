import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const CLAVE_APP = 'clave-app';

export async function hayHuella(): Promise<boolean> {
  const hayLector = await LocalAuthentication.hasHardwareAsync();
  const hayHuellas = await LocalAuthentication.isEnrolledAsync();
  return hayLector && hayHuellas;
}

export async function pedirHuellaAlEntrar(): Promise<boolean> {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirma que sos vos para entrar',
  });
  return resultado.success;
}

export async function guardarClaveApp(clave: string): Promise<void> {
  await SecureStore.setItemAsync(CLAVE_APP, clave);
}

export async function leerClaveApp(): Promise<string | null> {
  return SecureStore.getItemAsync(CLAVE_APP);
}

export async function borrarClaveApp(): Promise<void> {
  await SecureStore.deleteItemAsync(CLAVE_APP);
}