import React, { Component } from 'react';
import Box from '@mui/material/Box';
import VideoPlayer from './VideoPlayer';
import styled from 'styled-components';
import {getYoutubeId, getYoutubePlaylistUrl} from '../lib/sourceUtil';
// import { useSwiper } from 'swiper/react';

const Container = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
`
const NumDisplay = styled.div`
  position: absolute;
  top:10px;
  left:10px;
  background: white;
  width: 100px;
  z-index: 9999;

`

const HLSPlayer = (props) => {
    console.log('rerender hlsplayer', props)
    // const swiper = useSwiper();
    const {
        player=null, 
        playerNum=null,
        enableAutoRefresh=null, 
        enableOverlay=false,
        overlayContent='Default Overlay Content',
        overlayRightBtn='Default Right Button',
        overlayLeftBtn='Default left Button',
        startSecondsOffset=0,
        fluid=false,
        responsive=false,
        fill=false,
        aspectRatio='2:1',
        overlayBig=false,
        overlayModal=false,
    } = props;
    console.log('###### source in HLSPlayer:', overlayContent)
    console.log('!!! overlayContent in HLSPlayer:', overlayContent)

    const {
        width="100%",
        height=0,
        controls=false, 
        autoplay=true, 
        bigPlayButton=false, 
        bigPlayButtonCentered=false, 
        source={},
        type='application/x-mpegURL',
        LONG_BUFFERING_MS_SECONDS=3000
    } = props;
    const {activeSource} = props;
    const {setPlayer} = props;

    const [srcObject, setSrcObject] = React.useState({
        src: source.url,
        type,
        handleManifestRedirects: true
    })
    const [lastReloadTime, setLastReloadTime] = React.useState(Date.now());

    React.useEffect(() => {
        const reloadTimer = setTimeout(() => {
            setLastReloadTime(Date.now());
        }, 3600000 + Math.random()*20000)
        return () => {
            clearTimeout(reloadTimer);
        }
    }, [lastReloadTime])
    
    React.useEffect(() => {
        console.log('&&&& source changed:',source, lastReloadTime)
        const youtubeRegExp = /:\/\/www\.youtube\./;
        const isYoutubeUrl = youtubeRegExp.test(source.url);
        if(isYoutubeUrl){
            const youtubeId = getYoutubeId(source.url);
            getYoutubePlaylistUrl(youtubeId)
            .then((result) => {
                setSrcObject(srcObject => {
                    return {
                        ...srcObject,
                        src: result
                    }
                })
            });
        } else {
            Promise.resolve();
        }
    }, [source, lastReloadTime]);

    // const srcObject = {
    //     src: source.url,
    //     type,
    //     handleManifestRedirects: true,
    // }

    // make util...

    React.useEffect(() => {
        console.log('playbackRate: ', activeSource, source.url);
    }, [])

    // React.useEffect(() => {
    //   if(!show){
    //     swiper.slideNext();
    //   }
    // }, [show, swiper])

    const channelLog = console;
    const onPlayerReady = React.useCallback((player) => {
        channelLog.info("Player is ready");
        setPlayer(player);
        player.muted(true);
        const qualityLevels = player.qualityLevels();
        const youtubeRegExp = /:\/\/www\.youtube\./;
        const isYoutubeUrl = youtubeRegExp.test(source.url);
        if(isYoutubeUrl && qualityLevels) {
            qualityLevels.on('addqualitylevel', event => {
                const qualityLevel = event.qualityLevel;
                if(qualityLevel.height < 700){
                    qualityLevel.enabled = false
                }
                console.log(qualityLevel)
            })
        }
    }, [channelLog, setPlayer, source.url]);
    // const onPlayerReady = player => {
    //     channelLog.info("Player is ready");
    //     setPlayer(player);
    //     player.muted(true);
    //     const qualityLevels = player.qualityLevels();
    //     if(qualityLevels) {
    //         qualityLevels.on('addqualitylevel', event => {
    //             const qualityLevel = event.qualityLevel;
    //             if(qualityLevel.height < 200){
    //                 qualityLevel.enabled = false
    //             }
    //             console.log(qualityLevel)
    //         })
    //     }
    // }

    const onVideoPlay = React.useCallback(duration => {
        // channelLog.info("Video played at: ", duration);
    },[]);

    const onVideoPause = React.useCallback(duration =>{
        // channelLog.info("Video paused at: ", duration);
    },[]);

    const onVideoTimeUpdate =  React.useCallback(duration => {
        // channelLog.info("Time updated: ", duration);
    },[]);

    const onVideoSeeking =  React.useCallback(duration => {
        // channelLog.info("Video seeking: ", duration);
    },[]);

    const onVideoSeeked =  React.useCallback((from, to) => {
        channelLog.info(`Video seeked from ${from} to ${to}`);
        // setPlayerSeeked({channelNumber, seeked:to})
    },[])

    const onVideoError = React.useCallback((error) => {

        channelLog.error(`error occurred: ${error && error.message}`);
        if(source.url === '') return;
        // enableAutoRefresh()
    },[])

    const onVideoEnd = React.useCallback(() => {
        // channelLog.info("Video ended");
    },[])

    const onVideoCanPlay = React.useCallback(player => {
        channelLog.info(`can play : `);
    },[]);

    let refreshTimer = null;

    const isValidStopDuration = duration => {
        return typeof(duration) === 'number' && duration !== 0 && duration !== Infinity;
    }

    const onLoadStart = player => {
        player.one('durationchange', () => {
            const duration = player.duration();
            let realDuration;
            if(isValidStopDuration(duration)){
                realDuration = duration;
            } else {
                realDuration = 0;
            }
        })
    }

    const onVideoOtherEvent = (eventName, player) => {
        console.log(`event occurred: ${eventName}`);
        if(eventName === 'abort' && enableAutoRefresh !== null){
            refreshTimer = setInterval(() => {
                channelLog.info('refresh player because of long buffering')
            },LONG_BUFFERING_MS_SECONDS)
            return
        } else if(eventName === 'abort' && enableAutoRefresh === null) {
            // channelLog.debug('abort but not start refresh timer because enableAutoRefresh parameter is null');
            return
        }
        if(eventName === 'playing' || eventName === 'loadstart' || eventName === 'waiting'){
            if(refreshTimer === null) {
                // channelLog.debug('playing, loadstart or waiting event emitted. but do not clearTimeout(refreshTimer) because refreshTimer is null. exit')
                return;
            }
            // channelLog.debug('clear refresh timer.')
            refreshTimer = null;
            return
        }
        if(eventName === 'ratechange'){
            // if ratechange occurred not manually but by changing media, just return
            if(player.readyState() === 0) return;
        }
    }

    return (
      <Container>
        <NumDisplay>{playerNum}</NumDisplay>
        <VideoPlayer
            controls={controls}
            src={srcObject}
            // poster={this.state.video.poster}
            autoplay={autoplay}
            bigPlayButton={bigPlayButton}
            bigPlayButtonCentered={bigPlayButtonCentered}
            width={width}
            height={height}
            onCanPlay={onVideoCanPlay}
            onReady={onPlayerReady}
            onLoadStart={onLoadStart}
            onPlay={onVideoPlay}
            onPause={onVideoPause}
            onTimeUpdate={onVideoTimeUpdate}
            onSeeking={onVideoSeeking}
            onSeeked={onVideoSeeked}
            onError={onVideoError}
            onEnd={onVideoEnd}
            onOtherEvent={onVideoOtherEvent}
            handleManifestRedirects={true}
            liveui={true}
            enableOverlay={enableOverlay}
            overlayContent={overlayContent}
            overlayRightBtn={overlayRightBtn}
            overlayLeftBtn={overlayLeftBtn}
            startSecondsOffset={startSecondsOffset}
            inactivityTimeout={0}
            hideControls={['volume', 'timer']}
            fluid={fluid}
            responsive={responsive}
            aspectRatio={aspectRatio}
            fill={fill}
            overlayBig={overlayBig}
            overlayModal={overlayModal}
        />
      </Container>
    );
};

export default React.memo(HLSPlayer);
// export default HLSPlayer