// import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import { Button } from './components/Button'
import { Checkbox } from './components/Checkbox'
import { Heading } from './components/Heading'
import { Card } from './components/Card'
import SubmitButton from './components/SubmitButton'
import Dashboard from './pages/Dashboard'
import { Table } from './components/Table'
import { Popup } from './components/Popup'
import { useState } from 'react'
import { TextField } from './components/TextField'
import { TextArea } from './components/TextArea'
import Admin from './pages/Admin'
// import { BottomNav } from './components/BottomNav'


function App() {

    //   const [checkboxState, setCheckboxState] = useState(true);

    const doSomething = (row) => {
        console.log("clicked", row)
    }

    const columns = [
        { key: "title", label: "HABIT" },
        { key: "description", label: "DESCRIPTION" }
    ]

    const data = [
        { title: "10K Steps", description: "Walk daily" },
        { title: "Meditation", description: "5–10 mins" }
    ]
    const actions = [
        { label: "EDIT", onClick: row => doSomething(row) },
        { label: "DELETE", variant: "danger", onClick: row => doSomething(row) }
    ]

    const [isOpen, setIsOpen] = useState(true);


    return (
        <>
            <Admin></Admin>

            {/* <BottomNav></BottomNav> */}
            <Popup
                open={isOpen}
                title="ADD NEW HABIT"
                subtitle="This will apply to all users"
                actions={actions}
            >
                <TextField/>
                <TextArea/>
            </Popup>
            {/* <Dashboard /> */}
            {/* <Table actions={actions} data={data} columns={columns} /> */}
            {/* <Login></Login> */}

            {/* <Card>
            <Button>Click Me</Button>
            <br/>
            <Checkbox label="Can you check this" checked={checkboxState} onChange={() => setCheckboxState(!checkboxState)}></Checkbox>
            <br/>
            <Heading title="This is my title" subtitle="This is my subtitle"></Heading>
            <br/>
            <SubmitButton>Enter the dungeon</SubmitButton>
        </Card> */}
        </>
    )
}

export default App
