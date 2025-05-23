import React, {useCallback, useContext, useMemo, useState} from 'react'
import dayjs from 'dayjs'
import RecentMediaEntry from './RecentMediaEntry.jsx'
import List from '@mui/material/List'
import {setDeepPush, setDeepUnique} from '../util/setDeep'
import entryName from '../entries/entryName'
import ExportThanksButton from './ExportThanksButton.jsx'
import DBContext from '../app/DBContext.jsx'
import Link from '@mui/material/Link'
import allEntries from '../data/data.json'
import deletedEntries from '../data/deletedEntries.json'
import ChoiceButtonGroup from '../util/ChoiceButtonGroup.jsx'

/**
 * @prop {object[]} visibleEntries
 */

function RecentChangesPage() {
    const {adminRole} = useContext(DBContext)

    const options = useMemo(() => {
        return [
            {label: 'Recently Added Photos'},
            {label: 'Deleted Entries'}
        ]
    }, [])

    const [selected, setSelected] = useState(options[0])
    const handleChange = useCallback(newValue => setSelected(newValue), [])

    const recentDays = 14
    const [recentHours, setRecentHours] = useState(recentDays * 24)
    const recentText = recentHours === recentDays * 24 ? `${recentDays} days` : `${recentHours} hours`

    let title
    switch (selected.label) {
        case 'Recently Added Photos':
            title = `Recently Added Images (${recentText})`
            break
        case 'Deleted Entries':
            title = 'Deleted Entries'
            break
        default:
    }

    const {newImageEntries = [], newImageContributors = []} = getNewImageEntries({entries: allEntries, recentHours})
    newImageEntries?.sort((a, b) => {
        return Math.floor(dayjs(b.lastUpdated).valueOf() / 3600) - Math.floor(dayjs(a.lastUpdated).valueOf() / 3600)
            || `${a.makeModels[0].make}${a.makeModels[0].model}`.localeCompare(`${b.makeModels[0].make}${b.makeModels[0].model}`)
    })
    newImageContributors?.sort((a, b) => {
        return a.localeCompare(b)
    })

    const visibleEntries = selected.label === 'Deleted Entries'
        ? deletedEntries.sort((a, b) => {
            return Math.floor(dayjs(b.dateDeleted).valueOf() / 3600) - Math.floor(dayjs(a.dateDeleted).valueOf() / 3600)
                || a.name.localeCompare(b.name)
        })
        : newImageEntries

    const thanks = newImageContributors.length > 0
        ? ('Many thanks to @' + newImageContributors.join(' @') + '!\n')
        : 'No new contributors found\n'
    const links = newImageEntries
        ? newImageEntries.map((entry) => {
            return `[${entryName(entry)}](https://lpubelts.com/#/locks?tab=search&search=${entry.id}&id=${entry.id}&name=${entryName(entry, 'safe')})`
        })
        : []
    const thanksText = [thanks, ...links].join('\n- ') +
        '\n\n' + 'See all recent additions at **https://lpubelts.com/#/recent**'

    const setHours = useCallback((hours) => {
        setRecentHours(hours)
    }, [])

    return (
        <React.Fragment>
            <div style={{marginBottom: 20, marginTop: 1}}>
                <ChoiceButtonGroup options={options} onChange={handleChange}/>
            </div>

            <div style={{
                padding: 0,
                maxWidth: 700,
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 20,
                fontWeight: 500,
                fontSize: '1.5rem'
            }}>
                {title}
            </div>
            {visibleEntries.length > 0
                ? <List style={{padding: 0, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto'}}>
                    {visibleEntries.map(entry =>
                        <RecentMediaEntry entry={entry} key={entry.id}/>
                    )}
                </List>
                : <div style={{
                    padding: 0,
                    maxWidth: 700,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: 20,
                    fontSize: '1rem'
                }}>
                    None found
                </div>
            }
            {adminRole && selected.label === 'Recently Added Photos' &&
                <div style={{
                    padding: 0,
                    maxWidth: 700,
                    margin: '30px auto',
                    fontSize: '1rem',
                    textAlign: 'center'
                }}>
                    Last <Link onClick={() => setHours(12)}
                               style={{color: recentHours === 12 ? '#de9c12' : '#14a7c7'}}>12</Link> |&nbsp;
                    <Link onClick={() => setHours(24)}
                          style={{color: recentHours === 24 ? '#de9c12' : '#14a7c7'}}>24</Link> |&nbsp;
                    <Link onClick={() => setHours(48)}
                          style={{color: recentHours === 48 ? '#de9c12' : '#14a7c7'}}>48</Link> |&nbsp;
                    <Link onClick={() => setHours(recentDays * 24)}
                          style={{color: recentHours === recentDays * 24 ? '#de9c12' : '#14a7c7'}}>all</Link> hours<br/><br/>
                    <ExportThanksButton thanksText={thanksText}/>
                </div>
            }
        </React.Fragment>
    )
}

export default RecentChangesPage

function getNewImageEntries({entries, recentHours}) {
    return entries.reduce((acc, entry) => {
        const newMedia = entry?.media?.filter(m => dayjs(m.dateAdded).isAfter(dayjs().subtract(recentHours, 'hour')))
            .sort((a, b) => {
                setDeepUnique(acc, ['newImageContributors'], a.title.replace('By: ', ''))
                return dayjs(b.dateAdded).diff(dayjs(a.dateAdded))
            })
        if (newMedia?.length > 0) {
            setDeepPush(acc, ['newImageEntries'], {...entry, media: newMedia})
        }
        return acc
    }, {})
}

