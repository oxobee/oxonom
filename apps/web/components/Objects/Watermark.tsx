import Image from 'next/image'
import Link from 'next/link'
import lrnTextLogo from '@public/lrn-text.svg'
import React from 'react'
import { useOrg } from '../Contexts/OrgContext'
import { useTranslation } from 'react-i18next'
import { usePlan } from '@components/Hooks/usePlan'
import { getDeploymentMode } from '@services/config/config'

function Watermark() {
    return null
}

export default Watermark