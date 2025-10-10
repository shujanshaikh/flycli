import './App.css'

function App() {
  const pathname = window.location.pathname || '/';
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  const initialUrl = pathname + search + hash;

  return (
    <>
   <iframe src={initialUrl}
   title="Main user app"
   className="fixed inset-0 m-0 size-full p-0"
   id="user-app-iframe" /> 
   <h1>Toolbar</h1>
   </>
  )

}

export default App
