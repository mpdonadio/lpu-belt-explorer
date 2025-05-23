import IconButton from '@mui/material/IconButton'
import React, {useCallback, useContext, useState} from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Tooltip from '@mui/material/Tooltip'

import ListAltIcon from '@mui/icons-material/ListAlt'
import EvidenceForm from './EvidenceForm.jsx'
import Backdrop from '@mui/material/Backdrop'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import ScorecardDataContext from './ScorecardDataProvider'

function EvidenceButton({id, owner}) {

    const [editRecId, setEditRecId] = useState(null)
    const {cardActivity} = useContext(ScorecardDataContext)

    const recordings = cardActivity
        .filter(evid => evid.id === id)
        .filter(x => x)

    const handleOverlayOpen = useCallback(id => {
        setEditRecId(id)
    }, [])

    const handleOverlayClose = useCallback(() => {
        setEditRecId(null)
    }, [])

    return (
        <React.Fragment>
            <Tooltip title='My Collection' arrow disableFocusListener>
                <IconButton
                    variant='outlined'
                    color='inherit'
                    onClick={handleOverlayOpen}
                >
                    <ListAltIcon color={recordings.length > 0 ? 'secondary' : 'inherit'} fontSize='medium'/>
                </IconButton>
            </Tooltip>
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={!!editRecId} onClick={null}
            >
                {!!editRecId &&
                    <Card style={{
                        maxWidth: 600,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        border: '1px solid #666',
                        opacity: 1
                    }}>
                        <CardHeader title={'Documentation'}
                                    action={<HighlightOffIcon sx={{cursor: 'pointer'}}/>}
                                    style={{paddingBottom: 0}}
                                    onClick={handleOverlayClose}/>
                        <CardContent>
                            {recordings.map((rec, index) =>
                                <EvidenceForm activity={rec} handleUpdate={handleOverlayClose} source={'collectionButton'}
                                              key={index} owner={owner}/>
                            )}
                            {recordings.length === 0 &&
                                <EvidenceForm activity={null} lockId={id} handleUpdate={handleOverlayClose}
                                              source={'collectionButton'} owner={owner}/>
                            }
                        </CardContent>
                    </Card>
                }
            </Backdrop>

        </React.Fragment>
    )
}

export default EvidenceButton
