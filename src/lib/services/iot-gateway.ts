"use client"

export interface IoTDevice {
    id: string
    name: string
    ip: string
    type: 'camera' | 'sensor' | 'controller'
    status: 'online' | 'offline'
}

class IoTGateway {
    private devices: IoTDevice[] = []

    async discover() {
        // Mock discovery logic - in reality, would scan network or listen for MDNS/POST
        console.log("[IoT] Scanning for devices...")
        this.devices = [
            { id: 'esp-01', name: 'ESP32 Camera 1', ip: '192.168.1.50', type: 'camera', status: 'online' }
        ]
        return this.devices
    }

    getStreamUrl(deviceId: string) {
        const device = this.devices.find(d => d.id === deviceId)
        if (device && device.type === 'camera') {
            return `http://${device.ip}/stream` // Standard ESP32 MJPEG stream
        }
        return null
    }

    // Bridge MJPEG stream to a canvas or video element for TF.js
    async attachStream(deviceId: string, videoElement: HTMLVideoElement) {
        const url = this.getStreamUrl(deviceId)
        if (url) {
            videoElement.src = url
            await videoElement.play()
        }
    }
}

export const iotGateway = new IoTGateway()
