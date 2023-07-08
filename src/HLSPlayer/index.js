import React, { Component } from 'react';
import Box from '@mui/material/Box';
import VideoPlayer from './VideoPlayer';
import styled from 'styled-components';
import {getYoutubeId, getYoutubePlaylistUrl} from '../lib/sourceUtil';
import usePrevious from '../hooks/usePrevious';
// import { useSwiper } from 'swiper/react';

const Container = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
`
const NumDisplay = styled.div`
  display: ${props => !props.show && 'none'};
  position: absolute;
  top: ${props => (props.position === 'topLeft' || props.position === 'topRight') && '10px'};
  bottom: ${props => (props.position === 'bottomLeft' || props.position === 'bottomRight') && '10px'};
  left: ${props => (props.position === 'topLeft' || props.position === 'bottomLeft') && '10px'};
  right: ${props => (props.position === 'topRight' || props.position === 'bottomRight') && '10px'};
  background: black;
  width: 80px;
  z-index: 1000;
`
const CHECK_INTERNAL_SEC = 2;

const getRandomCountdown = refreshInterval => {
    return Math.ceil(refreshInterval + Math.random() * 20);
};

const find720p = (srcArray) => {
    const src720p = srcArray.find(src => {
        const mp4MimeType = "video/mp4"
        return src.mimeType.includes(mp4MimeType) && src.height >= 720;
    })
    console.log('**',srcArray)
    return src720p ? src720p.url : '';
}
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
        autoRefresh=false,
        cctvIndex,
        currentIndexRef,
        lastLoaded,
        refreshMode,
        refreshInterval
    } = props;
    console.log('###### source in HLSPlayer:', autoRefresh, overlayContent, cctvIndex, currentIndexRef, lastLoaded)
    console.log('!!! overlayContent in HLSPlayer:',playerNum, overlayContent)

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

    // const RELOAD_COUNTDOWN = Math.ceil(30 + Math.random() * 20);
    // const RELOAD_COUNTDOWN = Math.ceil(refreshInterval + Math.random() * 20);
    const prevRefreshInterval = usePrevious(refreshInterval);
    const isRefreshIntervalChanged = prevRefreshInterval !== refreshInterval;
    const RELOAD_COUNTDOWN = getRandomCountdown(refreshInterval)
    const [currentCountDown, setCurrentCountDown] = React.useState(RELOAD_COUNTDOWN);
    const [srcObject, setSrcObject] = React.useState({
        src: source.url,
        type,
        handleManifestRedirects: true
    })
    const [lastReloadTime, setLastReloadTime] = React.useState(Date.now());

    const isActive = !autoRefresh ? true : cctvIndex === currentIndexRef.current;
    // React.useLayoutEffect(() => {
    //     setCurrentCountDown(RELOAD_COUNTDOWN);
    // }, [RELOAD_COUNTDOWN])

    React.useEffect(() => {
        console.log('&&&& source changed:',source, lastReloadTime)
        const youtubeRegExp = /:\/\/www\.youtube\./;
        const isYoutubeUrl = youtubeRegExp.test(source.url);
        if(isYoutubeUrl){
            const youtubeId = getYoutubeId(source.url);
            getYoutubePlaylistUrl(youtubeId)
            .then((result) => {
                let src = result;
                let type = 'application/x-mpegURL'
                if(Array.isArray(result)){
                    src = find720p(result);
                    type = "video/mp4"
                }
                setSrcObject(srcObject => {
                    return {
                        ...srcObject,
                        src,
                        type
                    }
                })
            });
        } else {
            if(source.url !== undefined){

            setSrcObject(srcObject => {
                return {
                    ...srcObject,
                    src: source.url
                }
            })
            }
        }
    }, [source, lastReloadTime, lastLoaded, player, cctvIndex]);

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
        if(autoRefresh === true){
            setPlayer(cctvIndex, player);
        } else {
            setPlayer(20, player, playerNum);
        }
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
        // const timer = setInterval(() => {
        //   if(player === null) return;
        //   console.log('current time=', cctvIndex, player);
        //   setCurrentTime(player.currentTime());
        // },1000)
        // return () => {
        //   clearInterval(timer);
        // }
    }, [autoRefresh, cctvIndex, channelLog, playerNum, setPlayer, source.url]);
    // const onPlayerReady = player => {
    //     channelLog.info("Player is ready");
    //     setPlayer(player);
    //     player.muted(true);
    //     const qualityLehvels = player.qualityLevels();
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
        channelLog.info("Video played at: ", duration);
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
        channelLog.info("Video ended");
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

    React.useEffect(() => {
      if(refreshMode !== 'auto'){
        return;
      }
      if(isRefreshIntervalChanged){
        setCurrentCountDown(getRandomCountdown(refreshInterval))
      }
      const timer = setInterval(() => {
        if(player === null) {
          clearInterval(timer);
          return;
        }
        console.log('current time=', cctvIndex, player);
        setCurrentCountDown(currentCountDown => {
            return currentCountDown - CHECK_INTERNAL_SEC;
        })
      }, CHECK_INTERNAL_SEC * 1000)
      return () => {
        clearInterval(timer);
      }
    }, [cctvIndex, lastReloadTime, player, refreshMode, isRefreshIntervalChanged, refreshInterval])

    if(autoRefresh) {
      const countdown = Math.ceil(currentCountDown);
      console.log('####', countdown)
      if(countdown <= 0){
        if(isActive){
            //if active bypass reload
            setCurrentCountDown(RELOAD_COUNTDOWN);
            return;
        }
        // player.dispose();
        setLastReloadTime(Date.now());
        setCurrentCountDown(RELOAD_COUNTDOWN);
      }
    }
    return (
      <Container>
        <NumDisplay show={autoRefresh} position={'topLeft'}>{currentCountDown}</NumDisplay>
        <NumDisplay show={autoRefresh} position={'topRight'}>{currentCountDown}</NumDisplay>
        <NumDisplay show={autoRefresh} position={'bottomLeft'}>{currentCountDown}</NumDisplay>
        <NumDisplay show={autoRefresh} position={'bottomRight'}>{currentCountDown}</NumDisplay>
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