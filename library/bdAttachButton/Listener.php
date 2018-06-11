<?php

class bdAttachButton_Listener
{
    public static function load_class_XenForo_ControllerPublic_Attachment($class, array &$extend)
    {
        if ($class === 'XenForo_ControllerPublic_Attachment') {
            $extend[] = 'bdAttachButton_XenForo_ControllerPublic_Attachment';
        }
    }

    public static function file_health_check(XenForo_ControllerAdmin_Abstract $controller, array &$hashes)
    {
        $hashes += bdAttachButton_FileSums::getHashes();
    }
}
