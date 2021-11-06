import { route } from 'next/dist/server/router'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import * as React from 'react'

import { Avatar } from '~/components/Avatar'
import { Comments } from '~/components/Comments'
import { Detail } from '~/components/ListDetail/Detail'
import { TitleBar } from '~/components/ListDetail/TitleBar'
import routes from '~/config/routes'
import { CommentType, useGetQuestionQuery } from '~/graphql/types.generated'
import { timestampToCleanTime } from '~/lib/transformers'

import { MarkdownRenderer } from '../MarkdownRenderer'
import { QuestionActions } from './QuestionActions'

export function QuestionDetail({ id }) {
  const scrollContainerRef = React.useRef(null)
  const titleRef = React.useRef(null)
  const { data, loading, error } = useGetQuestionQuery({
    variables: { id },
  })

  if (loading) {
    return <Detail.Loading />
  }

  if (!data?.question || error) {
    return <Detail.Null />
  }

  const { question } = data
  const updatedAt = timestampToCleanTime({
    month: 'short',
    timestamp: data?.question.updatedAt,
  })

  return (
    <>
      <NextSeo
        title={question.title}
        description={question.description}
        openGraph={{
          title: question.title,
          description: question.description,
          images: [
            {
              url: routes.ama.seo.image,
              alt: routes.ama.seo.description,
            },
          ],
        }}
      />
      <Detail.Container data-cy="question-detail" ref={scrollContainerRef}>
        <TitleBar
          backButton
          globalMenu={false}
          backButtonHref={'/ama'}
          magicTitle
          title={question.title}
          titleRef={titleRef}
          scrollContainerRef={scrollContainerRef}
          trailingAccessory={<QuestionActions question={question} />}
        />

        <Detail.ContentContainer>
          <Detail.Header>
            <div className="flex items-center pb-2 space-x-4">
              <Link href={`/u/${question.author.username}`}>
                <a className="inline-flex">
                  <Avatar
                    user={question.author}
                    src={question.author.avatar}
                    width={32}
                    height={32}
                    quality={100}
                    layout="fixed"
                    className="rounded-full"
                  />
                </a>
              </Link>
              <div className="flex space-x-1">
                <Link href={`/u/${question.author.username}`}>
                  <a className="inline-flex space-x-1">
                    <span className="font-semibold leading-snug text-primary">
                      {question.author.name}
                    </span>
                    <span className="inline-flex font-normal leading-snug text-tertiary">
                      @{question.author.username}
                    </span>
                  </a>
                </Link>
                <p className="leading-snug text-quaternary">·</p>
                <p
                  className="leading-snug text-quaternary"
                  title={updatedAt.raw}
                >
                  {updatedAt.formatted}
                </p>
              </div>
            </div>
            <Detail.Title ref={titleRef}>{question.title}</Detail.Title>
            {question.description && (
              <MarkdownRenderer
                children={question.description}
                className="leading-normal prose comment"
                variant="comment"
              />
            )}
          </Detail.Header>
        </Detail.ContentContainer>

        {question.viewerCanComment && (
          <Comments refId={question.id} type={CommentType.Question} />
        )}
      </Detail.Container>
    </>
  )
}