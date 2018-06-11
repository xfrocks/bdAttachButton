/* global console, jQuery, XenForo */
/* jshint -W030 */
!function ($, window, document, _undefined) {
    'use strict';

    var buttonId = 'bdAttachButton_attach';

    var pushToButtons = function (buttons) {
        for (var i = 0; i < buttons.length; i++) {
            var buttonGroup = buttons[i];
            if (buttonGroup.length === _undefined) {
                continue;
            }

            for (var j = 0; j < buttonGroup.length; j++) {
                if (buttonGroup[j] === 'image') {
                    buttonGroup.push(buttonId);
                    return true;
                }
            }
        }

        return false;
    };

    var registerCustomButton = function (buttonsCustom, editor) {
        buttonsCustom[buttonId] = {
            title: editor.getText('bdAttachButton_attach'),
            callback: function () {
                return getAttachModal(editor);
            }
        };
    };

    var getAttachModal = function (editor) {
        var ed = editor.api,
            uploadUrl = editor.bdAttachButton_uploadUrl;
        if (!ed || !uploadUrl) {
            return;
        }

        if (!ed.bdAttachButton_modalCloseOriginal) {
            ed.bdAttachButton_modalCloseOriginal = ed.modalClose;
            ed.modalClose = function () {
                ed.bdAttachButton_modalCloseOriginal.call(ed);

                if (ed.bdAttachButton_$form) {
                    ed.bdAttachButton_$form.remove();
                    ed.bdAttachButton_$form = null;
                }

                if (ed.bdAttachButton_$hiddenFormContainer) {
                    ed.bdAttachButton_$hiddenFormContainer.show();
                    ed.bdAttachButton_$hiddenFormContainer = null;
                }
            };
        }

        var onModalInit = function () {
            var $inner = $('#redactor_modal_inner'),
                $formContainer = $inner.closest('form'),
                $form = $inner.children('form');

            if ($formContainer.length !== 1) {
                console.error('Could not find container <form />');
                return;
            }

            if ($form.length !== 1) {
                console.error('Could not find our <form />');
                return;
            }

            $form.find('.OverlayCloser').click(ed.restoreAndClose);

            $form.insertAfter($formContainer);
            ed.bdAttachButton_$form = $form;

            $formContainer.hide();
            ed.bdAttachButton_$hiddenFormContainer = $formContainer;

            XenForo.create('XenForo.AutoInlineUploader', $form);
            $form.on('AutoInlineUploadComplete', onUploadComplete);
        };

        var onUploadComplete = function (e) {
            var ajaxData = e.ajaxData;
            if (!ajaxData || !ajaxData.attachment_id || !ajaxData.thumbnailUrl || !ajaxData.viewUrl) {
                return;
            }

            e.preventDefault();

            ed.restoreSelection();

            var html = '<img src="' + ajaxData.viewUrl +
                '" class="attachFull bbCodeImage" alt="attachFull' +
                ajaxData.attachment_id + '" />&nbsp;';
            ed.pasteHtmlAtCaret(html);

            ed.modalClose();
            ed.observeImages();
            ed.syncCode();
            ed.focus();
        };

        ed.saveSelection();

        ed.modalInit(
            editor.getText('bdAttachButton_attach'),
            {url: uploadUrl + '&bdAttachButton_modal=1'},
            600,
            onModalInit
        );
    };

    $(document).on('EditorInit', function (e, extraParameters) {
        var editor = extraParameters.editor,
            config = extraParameters.config,
            $textarea = extraParameters.$textarea,
            $form = $textarea.closest('form');

        if ($form.length !== 1) {
            console.error('Could not find parent <form />');
            return;
        }

        var $attachmentUploader = $form.find('.AttachmentUploader');
        if ($attachmentUploader.length === 0) {
            console.error('Could not find attachment uploader');
            return;
        }

        if (editor.bdAttachButton_uploadUrl === _undefined) {
            var uploadUrl = '';
            $attachmentUploader.find('input').each(function () {
                var $input = $(this),
                    inputHref = $input.data('href');
                if (inputHref) {
                    uploadUrl = inputHref;
                }
            });
            if (uploadUrl === '') {
                console.log('Could not find upload URL');
                return;
            }
            editor.bdAttachButton_uploadUrl = uploadUrl;
        }

        if (!pushToButtons(config.buttons)) {
            console.error('Could not push to config.buttons');
            return;
        }

        registerCustomButton(config.buttonsCustom, editor);
    });
}(jQuery, this, document);