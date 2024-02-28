/**
 * create a remote log
 * @param props 
 */
export async function remoteLog(props: {
  type: string,
  message: string
}) {
  try {
    await fetch("https://www.comflowy.com/api/create-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(props)
    });
  } catch(err) {
    console.log("create remote log error:", err);
  }
}