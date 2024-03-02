/**
 * create a remote log
 * @param props 
 */
export async function remoteLog(props: {
  type: string,
  message: string
}) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_SERVER}/api/create-log`;
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