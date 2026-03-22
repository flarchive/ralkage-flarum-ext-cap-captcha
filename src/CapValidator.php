<?php

namespace Ralkage\CapCaptcha;

use Flarum\Settings\SettingsRepositoryInterface;
use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;

class CapValidator
{
    protected $settings;
    protected $logger;

    public function __construct(SettingsRepositoryInterface $settings, LoggerInterface $logger)
    {
        $this->settings = $settings;
        $this->logger = $logger;
    }

    public function isEnabled(): bool
    {
        $endpoint = $this->settings->get('ralkage-cap-captcha.api_endpoint');
        $secret = $this->settings->get('ralkage-cap-captcha.secret_key');

        return ! empty($endpoint) && ! empty($secret);
    }

    public function verify(string $token): bool
    {
        if (empty($token)) {
            return false;
        }

        $endpoint = rtrim($this->settings->get('ralkage-cap-captcha.api_endpoint'), '/');
        $secret = $this->settings->get('ralkage-cap-captcha.secret_key');

        $client = new Client();

        try {
            $response = $client->post($endpoint . '/siteverify', [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'secret' => $secret,
                    'response' => $token,
                ],
                'timeout' => 10,
            ]);

            $body = json_decode($response->getBody()->getContents(), true);

            return isset($body['success']) && $body['success'] === true;
        } catch (\Exception $e) {
            $this->logger->error('CapCaptcha verification error: ' . $e->getMessage());

            return false;
        }
    }

    public function shouldProtect(string $action): bool
    {
        if (! $this->isEnabled()) {
            return false;
        }

        $setting = $this->settings->get('ralkage-cap-captcha.protect_' . $action);

        return (bool) $setting;
    }
}
