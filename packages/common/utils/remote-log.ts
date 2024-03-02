/**
 * create a remote log
 * @param props 
 */
export async function remoteLog(props: {
  type: string,
  message: string
}) {
  try {
    const url = 'http://127.0.0.1:3000/api/create-log';
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(props)
    }
    await fetch(url, options);
  } catch(err) {
    console.log("create remote log error:", err);
  }
}