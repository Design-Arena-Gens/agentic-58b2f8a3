'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [parties, setParties] = useState([])
  const [newPartyName, setNewPartyName] = useState('')
  const [newTaskText, setNewTaskText] = useState({})
  const [editingParty, setEditingParty] = useState(null)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('taskTrackerData')
    if (saved) {
      setParties(JSON.parse(saved))
    } else {
      setParties([
        {
          id: 1,
          name: 'Party A',
          tasks: [
            { id: 1, text: 'Complete project proposal', completed: false },
            { id: 2, text: 'Review design mockups', completed: true },
          ]
        },
        {
          id: 2,
          name: 'Party B',
          tasks: [
            { id: 3, text: 'Client meeting preparation', completed: false },
            { id: 4, text: 'Update documentation', completed: false },
          ]
        }
      ])
    }
  }, [])

  useEffect(() => {
    if (parties.length > 0) {
      localStorage.setItem('taskTrackerData', JSON.stringify(parties))
    }
  }, [parties])

  const addParty = () => {
    if (!newPartyName.trim()) return
    const newParty = {
      id: Date.now(),
      name: newPartyName,
      tasks: []
    }
    setParties([...parties, newParty])
    setNewPartyName('')
  }

  const deleteParty = (partyId) => {
    setParties(parties.filter(p => p.id !== partyId))
  }

  const updatePartyName = (partyId, newName) => {
    setParties(parties.map(p =>
      p.id === partyId ? { ...p, name: newName } : p
    ))
    setEditingParty(null)
  }

  const addTask = (partyId) => {
    const taskText = newTaskText[partyId]
    if (!taskText?.trim()) return

    setParties(parties.map(p => {
      if (p.id === partyId) {
        return {
          ...p,
          tasks: [...p.tasks, { id: Date.now(), text: taskText, completed: false }]
        }
      }
      return p
    }))
    setNewTaskText({ ...newTaskText, [partyId]: '' })
  }

  const toggleTask = (partyId, taskId) => {
    setParties(parties.map(p => {
      if (p.id === partyId) {
        return {
          ...p,
          tasks: p.tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        }
      }
      return p
    }))
  }

  const deleteTask = (partyId, taskId) => {
    setParties(parties.map(p => {
      if (p.id === partyId) {
        return {
          ...p,
          tasks: p.tasks.filter(t => t.id !== taskId)
        }
      }
      return p
    }))
  }

  const updateTask = (partyId, taskId, newText) => {
    setParties(parties.map(p => {
      if (p.id === partyId) {
        return {
          ...p,
          tasks: p.tasks.map(t =>
            t.id === taskId ? { ...t, text: newText } : t
          )
        }
      }
      return p
    }))
    setEditingTask(null)
  }

  const getStats = (party) => {
    const total = party.tasks.length
    const completed = party.tasks.filter(t => t.completed).length
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Task Tracker</h1>
        <p className={styles.subtitle}>Organize your work by party groups</p>
      </div>

      <div className={styles.addParty}>
        <input
          type="text"
          placeholder="New party name..."
          value={newPartyName}
          onChange={(e) => setNewPartyName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addParty()}
          className={styles.input}
        />
        <button onClick={addParty} className={styles.addButton}>
          + Add Party
        </button>
      </div>

      <div className={styles.partiesGrid}>
        {parties.map(party => {
          const stats = getStats(party)
          return (
            <div key={party.id} className={styles.partyCard}>
              <div className={styles.partyHeader}>
                {editingParty === party.id ? (
                  <input
                    type="text"
                    defaultValue={party.name}
                    onBlur={(e) => updatePartyName(party.id, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && updatePartyName(party.id, e.target.value)}
                    className={styles.editInput}
                    autoFocus
                  />
                ) : (
                  <h2
                    className={styles.partyName}
                    onClick={() => setEditingParty(party.id)}
                  >
                    {party.name}
                  </h2>
                )}
                <button
                  onClick={() => deleteParty(party.id)}
                  className={styles.deletePartyButton}
                  title="Delete party"
                >
                  ×
                </button>
              </div>

              <div className={styles.statsBar}>
                <div className={styles.statsText}>
                  {stats.completed} / {stats.total} tasks completed ({stats.percentage}%)
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>

              <div className={styles.taskList}>
                {party.tasks.map(task => (
                  <div key={task.id} className={styles.taskItem}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(party.id, task.id)}
                      className={styles.checkbox}
                    />
                    {editingTask === task.id ? (
                      <input
                        type="text"
                        defaultValue={task.text}
                        onBlur={(e) => updateTask(party.id, task.id, e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && updateTask(party.id, task.id, e.target.value)}
                        className={styles.taskEditInput}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={task.completed ? styles.taskTextCompleted : styles.taskText}
                        onClick={() => setEditingTask(task.id)}
                      >
                        {task.text}
                      </span>
                    )}
                    <button
                      onClick={() => deleteTask(party.id, task.id)}
                      className={styles.deleteTaskButton}
                      title="Delete task"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.addTask}>
                <input
                  type="text"
                  placeholder="New task..."
                  value={newTaskText[party.id] || ''}
                  onChange={(e) => setNewTaskText({ ...newTaskText, [party.id]: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addTask(party.id)}
                  className={styles.taskInput}
                />
                <button onClick={() => addTask(party.id)} className={styles.addTaskButton}>
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {parties.length === 0 && (
        <div className={styles.emptyState}>
          <p>No parties yet. Add one to get started!</p>
        </div>
      )}
    </div>
  )
}
