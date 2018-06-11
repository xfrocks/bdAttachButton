<?php

class bdAttachButton_XenForo_ControllerPublic_Attachment extends XFCP_bdAttachButton_XenForo_ControllerPublic_Attachment
{
    public function actionUpload()
    {
        /** @var XenForo_ControllerResponse_View $response */
        $response = parent::actionUpload();

        if ($this->_input->filterSingle('bdAttachButton_modal', XenForo_Input::BOOLEAN)) {
            $response = $this->responseView(
                'XenForo_ViewPublic_Editor_Dialog',
                'attachment_upload_overlay',
                $response->params
            );
        }

        return $response;
    }
}
