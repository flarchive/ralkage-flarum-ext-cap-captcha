<?php

namespace Ralkage\CapCaptcha\Middleware;

use Flarum\Foundation\ValidationException;
use Flarum\Locale\Translator;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Ralkage\CapCaptcha\CapValidator;

class ValidateLoginCaptcha implements MiddlewareInterface
{
    protected $validator;
    protected $translator;

    public function __construct(CapValidator $validator, Translator $translator)
    {
        $this->validator = $validator;
        $this->translator = $translator;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $path = $request->getUri()->getPath();
        $method = $request->getMethod();

        // Only intercept POST /login
        if ($method === 'POST' && preg_match('#/login$#', $path)) {
            if ($this->validator->shouldProtect('login')) {
                $body = $request->getParsedBody();
                $token = $body['capToken'] ?? '';

                if (! $this->validator->verify($token)) {
                    throw new ValidationException([
                        'capToken' => $this->translator->trans('ralkage-cap-captcha.api.invalid_captcha'),
                    ]);
                }
            }
        }

        return $handler->handle($request);
    }
}
